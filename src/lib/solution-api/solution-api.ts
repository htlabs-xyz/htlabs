import { createHash, createHmac, timingSafeEqual } from 'node:crypto';

import { GoClawClientError, type GoClawClient } from './goclaw-client';

const BODY_LIMIT_BYTES = 8_192;
const MESSAGE_LIMIT_CHARACTERS = 2_000;
const COOKIE_NAME = '__Host-htlabs_solution_session';
const LOCAL_COOKIE_NAME = 'htlabs_solution_session_dev';
const IDEMPOTENCY_PENDING_TTL_SECONDS = 45;
const IDEMPOTENCY_TTL_SECONDS = 86_400;
const TOKEN_PATTERN = /^[A-Za-z0-9_-]{1,128}$/;
const UUID_V4_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export interface SolutionReply {
  message: string;
  conversationId: string;
}

export interface RateLimiter {
  consume(key: string, limit: number, windowSeconds: number): Promise<{
    allowed: boolean;
    retryAfterSeconds: number;
  }>;
}

type IdempotencyBegin =
  | { state: 'new' }
  | { state: 'pending' }
  | { state: 'conflict' }
  | { state: 'replay'; response: SolutionReply };

export interface IdempotencyStore {
  begin(key: string, bodyDigest: string, ttlSeconds: number): Promise<IdempotencyBegin>;
  complete(
    key: string,
    bodyDigest: string,
    response: SolutionReply,
    ttlSeconds: number,
  ): Promise<void>;
}

export interface SolutionApiDependencies {
  enabled: boolean;
  allowedOrigins: Set<string>;
  sessionSecret: Uint8Array;
  sessionTtlSeconds: number;
  secureCookies?: boolean;
  now: () => Date;
  clientAddress: string;
  rateLimiter: RateLimiter;
  idempotency: IdempotencyStore;
  goclaw: GoClawClient;
}

function base64url(bytes: Uint8Array): string {
  return Buffer.from(bytes).toString('base64url');
}

function hmac(secret: Uint8Array, value: string): Buffer {
  return createHmac('sha256', secret).update(value).digest();
}

function equalBase64url(expected: Uint8Array, actual: string): boolean {
  let decoded: Buffer;
  try {
    decoded = Buffer.from(actual, 'base64url');
  } catch {
    return false;
  }
  return decoded.length === expected.length && timingSafeEqual(Buffer.from(expected), decoded);
}

export async function createSessionCookie(
  id: string,
  expiresAt: number,
  secret: Uint8Array,
): Promise<string> {
  const payload = `s1.${id}.${expiresAt}`;
  return `${payload}.${base64url(hmac(secret, `session\0${payload}`))}`;
}

export async function parseSessionCookie(
  value: string,
  secret: Uint8Array,
  nowSeconds: number,
): Promise<{ id: string; expiresAt: number } | null> {
  if (value.length > 256) return null;
  const parts = value.split('.');
  if (parts.length !== 4 || parts[0] !== 's1' || !TOKEN_PATTERN.test(parts[1])) return null;
  if (!/^\d{10}$/.test(parts[2])) return null;
  const expiresAt = Number(parts[2]);
  if (!Number.isSafeInteger(expiresAt) || expiresAt <= nowSeconds) return null;
  const payload = parts.slice(0, 3).join('.');
  if (!equalBase64url(hmac(secret, `session\0${payload}`), parts[3])) return null;
  return { id: parts[1], expiresAt };
}

export async function createConversationToken(
  sessionId: string,
  nonce: Uint8Array,
  secret: Uint8Array,
): Promise<string> {
  if (nonce.byteLength !== 16) throw new Error('invalid conversation nonce');
  const encodedNonce = base64url(nonce);
  const tag = hmac(secret, `conversation\0${sessionId}\0${encodedNonce}`).subarray(0, 16);
  return `c1_${encodedNonce}_${base64url(tag)}`;
}

export async function parseConversationToken(
  token: string,
  sessionId: string,
  secret: Uint8Array,
): Promise<Uint8Array | null> {
  if (!TOKEN_PATTERN.test(token)) return null;
  const match = /^c1_([A-Za-z0-9_-]{22})_([A-Za-z0-9_-]{22})$/.exec(token);
  if (!match) return null;
  const expected = hmac(secret, `conversation\0${sessionId}\0${match[1]}`).subarray(0, 16);
  if (!equalBase64url(expected, match[2])) return null;
  const nonce = Buffer.from(match[1], 'base64url');
  return nonce.length === 16 ? nonce : null;
}

function json(status: number, body: unknown, extraHeaders: HeadersInit = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'cache-control': 'no-store',
      'content-type': 'application/json; charset=utf-8',
      'x-content-type-options': 'nosniff',
      ...extraHeaders,
    },
  });
}

function error(status: number, code: string, extraHeaders: HeadersInit = {}): Response {
  return json(status, { error: { code } }, extraHeaders);
}

async function readBoundedBody(request: Request): Promise<Uint8Array | null> {
  const contentLength = request.headers.get('content-length');
  if (contentLength !== null) {
    if (!/^\d{1,10}$/.test(contentLength) || Number(contentLength) > BODY_LIMIT_BYTES) return null;
  }
  const reader = request.body?.getReader();
  if (!reader) return new Uint8Array();
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > BODY_LIMIT_BYTES) {
      await reader.cancel();
      return null;
    }
    chunks.push(value);
  }
  const body = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return body;
}

function parseCookies(header: string | null): Map<string, string> {
  const cookies = new Map<string, string>();
  if (!header || header.length > 4_096) return cookies;
  for (const part of header.split(';')) {
    const separator = part.indexOf('=');
    if (separator < 1) continue;
    cookies.set(part.slice(0, separator).trim(), part.slice(separator + 1).trim());
  }
  return cookies;
}

function validateReply(reply: SolutionReply): boolean {
  const message = typeof reply.message === 'string' ? reply.message.trim() : '';
  const questionCount = Array.from(message).filter((character) =>
    character === '?' || character === '？' || character === '؟'
  ).length;
  return (
    message.length > 0 &&
    Array.from(message).length <= 300 &&
    questionCount <= 1 &&
    typeof reply.conversationId === 'string' &&
    TOKEN_PATTERN.test(reply.conversationId)
  );
}

async function enforceRateLimits(deps: SolutionApiDependencies, sessionId: string) {
  const networkDigest = base64url(hmac(deps.sessionSecret, `network\0${deps.clientAddress}`)).slice(0, 32);
  const sessionDigest = base64url(hmac(deps.sessionSecret, `rate-session\0${sessionId}`)).slice(0, 32);
  for (const [key, limit] of [
    ['global', 120],
    [`network:${networkDigest}`, 30],
    [`session:${sessionDigest}`, 20],
  ] as const) {
    const result = await deps.rateLimiter.consume(key, limit, 60);
    if (!result.allowed) return result;
  }
  return { allowed: true, retryAfterSeconds: 0 };
}

export async function handleSolutionChat(
  request: Request,
  deps: SolutionApiDependencies,
): Promise<Response> {
  if (!deps.enabled) return error(503, 'SERVICE_UNAVAILABLE');
  if (request.method !== 'POST' && request.method !== 'DELETE') {
    return error(405, 'METHOD_NOT_ALLOWED', { allow: 'POST, DELETE' });
  }
  const origin = request.headers.get('origin');
  if (!origin || !deps.allowedOrigins.has(origin)) return error(403, 'ORIGIN_FORBIDDEN');
  if (request.method === 'DELETE') {
    // GoClaw's verified HTTP webhook contract has no delete/TTL operation. Do not
    // pretend that rotating a browser cookie erased the durable upstream session.
    return error(501, 'DELETION_UNAVAILABLE');
  }
  const encoding = request.headers.get('content-encoding');
  if (encoding && encoding.toLowerCase() !== 'identity') return error(415, 'UNSUPPORTED_ENCODING');
  const contentType = request.headers.get('content-type')?.toLowerCase().replace(/\s/g, '');
  if (contentType !== 'application/json' && contentType !== 'application/json;charset=utf-8') {
    return error(415, 'UNSUPPORTED_MEDIA_TYPE');
  }
  const bodyBytes = await readBoundedBody(request);
  if (bodyBytes === null) return error(413, 'PAYLOAD_TOO_LARGE');
  let payload: unknown;
  try {
    payload = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bodyBytes));
  } catch {
    return error(400, 'INVALID_REQUEST');
  }
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return error(400, 'INVALID_REQUEST');
  }
  const keys = Object.keys(payload);
  if (keys.some((key) => key !== 'message' && key !== 'conversationId')) {
    return error(400, 'INVALID_REQUEST');
  }
  const candidate = payload as Record<string, unknown>;
  if (typeof candidate.message !== 'string') return error(400, 'INVALID_REQUEST');
  const message = candidate.message.trim();
  if (!message || Array.from(message).length > MESSAGE_LIMIT_CHARACTERS) {
    return error(400, 'INVALID_REQUEST');
  }
  if (candidate.conversationId !== undefined && (
    typeof candidate.conversationId !== 'string' || !TOKEN_PATTERN.test(candidate.conversationId)
  )) return error(400, 'INVALID_CONVERSATION');
  const idempotencyKey = request.headers.get('idempotency-key');
  if (!idempotencyKey || !UUID_V4_PATTERN.test(idempotencyKey)) {
    return error(400, 'INVALID_IDEMPOTENCY_KEY');
  }

  const nowSeconds = Math.floor(deps.now().getTime() / 1_000);
  const secureCookies = deps.secureCookies !== false;
  const cookieName = secureCookies ? COOKIE_NAME : LOCAL_COOKIE_NAME;
  const cookieValue = parseCookies(request.headers.get('cookie')).get(cookieName);
  let session = cookieValue
    ? await parseSessionCookie(cookieValue, deps.sessionSecret, nowSeconds)
    : null;
  let setCookie: string | undefined;
  if (!session) {
    // The first response can be lost before Set-Cookie reaches the browser.
    // Derive a pseudorandom, server-owned ID from the unguessable turn key so
    // the same retry cannot fork its session or conflict with itself.
    const id = base64url(
      hmac(deps.sessionSecret, `new-session\0${idempotencyKey}`),
    ).slice(0, 32);
    const expiresAt = nowSeconds + deps.sessionTtlSeconds;
    session = { id, expiresAt };
    const signed = await createSessionCookie(id, expiresAt, deps.sessionSecret);
    const secureAttribute = secureCookies ? '; Secure' : '';
    setCookie = `${cookieName}=${signed}; Path=/; Max-Age=${deps.sessionTtlSeconds}; HttpOnly${secureAttribute}; SameSite=Lax`;
  }
  const sessionResponse = (response: Response): Response => {
    if (setCookie) response.headers.set('set-cookie', setCookie);
    return response;
  };

  let nonce: Uint8Array;
  let conversationId: string;
  if (typeof candidate.conversationId === 'string') {
    const parsed = await parseConversationToken(candidate.conversationId, session.id, deps.sessionSecret);
    if (!parsed) return sessionResponse(error(400, 'INVALID_CONVERSATION'));
    nonce = parsed;
    conversationId = candidate.conversationId;
  } else {
    // A retry of the first turn has no conversationId yet. Derive this nonce
    // from the server-authenticated session + idempotency capability so that a
    // transient failure cannot silently fork the GoClaw conversation.
    nonce = hmac(
      deps.sessionSecret,
      `new-conversation\0${session.id}\0${idempotencyKey}`,
    ).subarray(0, 16);
    conversationId = await createConversationToken(session.id, nonce, deps.sessionSecret);
  }

  try {
    const rate = await enforceRateLimits(deps, session.id);
    if (!rate.allowed) {
      return sessionResponse(error(429, 'RATE_LIMITED', { 'retry-after': String(rate.retryAfterSeconds) }));
    }
  } catch {
    return sessionResponse(error(503, 'SERVICE_UNAVAILABLE'));
  }

  const bodyDigest = createHash('sha256')
    .update(session.id)
    .update('\0')
    .update(conversationId)
    .update('\0')
    .update(message)
    .digest('hex');
  let reservation: IdempotencyBegin;
  try {
    reservation = await deps.idempotency.begin(
      idempotencyKey,
      bodyDigest,
      IDEMPOTENCY_PENDING_TTL_SECONDS,
    );
  } catch {
    return sessionResponse(error(503, 'SERVICE_UNAVAILABLE'));
  }
  if (reservation.state === 'conflict') return sessionResponse(error(409, 'IDEMPOTENCY_CONFLICT'));
  if (reservation.state === 'pending') return sessionResponse(error(425, 'REQUEST_IN_PROGRESS', { 'retry-after': '2' }));
  if (reservation.state === 'replay') {
    if (
      !validateReply(reservation.response) ||
      reservation.response.conversationId !== conversationId
    ) return sessionResponse(error(503, 'SERVICE_UNAVAILABLE'));
    return sessionResponse(json(200, reservation.response, { 'x-idempotency-replayed': 'true' }));
  }

  const nonceEncoded = base64url(nonce);
  const sessionKey = `htlabs_solution_${base64url(hmac(deps.sessionSecret, `goclaw-session\0${session.id}\0${nonceEncoded}`)).slice(0, 32)}`;
  let upstream: { message: string };
  try {
    upstream = await deps.goclaw.reply({ message, sessionKey, idempotencyKey });
  } catch (upstreamError) {
    if (upstreamError instanceof GoClawClientError && upstreamError.code === 'UPSTREAM_TIMEOUT') {
      return sessionResponse(error(504, 'UPSTREAM_TIMEOUT'));
    }
    return sessionResponse(error(502, 'UPSTREAM_UNAVAILABLE'));
  }
  const responseBody = { message: upstream.message, conversationId };
  if (!validateReply(responseBody)) return sessionResponse(error(502, 'UPSTREAM_UNAVAILABLE'));
  try {
    await deps.idempotency.complete(
      idempotencyKey,
      bodyDigest,
      responseBody,
      IDEMPOTENCY_TTL_SECONDS,
    );
  } catch {
    return sessionResponse(error(503, 'SERVICE_UNAVAILABLE'));
  }
  return sessionResponse(json(200, responseBody));
}
