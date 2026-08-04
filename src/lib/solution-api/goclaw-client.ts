import { createHmac } from 'node:crypto';

export const GOCLAW_CONTRACT = 'goclaw-webhook-llm-hmac-v1@2f3d68e';
const MAX_OUTPUT_CHARACTERS = 300;
const MAX_RESPONSE_BYTES = 8_192;

export interface GoClawReplyInput {
  message: string;
  sessionKey: string;
  idempotencyKey: string;
}

export interface GoClawClient {
  reply(input: GoClawReplyInput): Promise<{ message: string }>;
}

export class GoClawClientError extends Error {
  readonly code: 'UPSTREAM_TIMEOUT' | 'UPSTREAM_UNAVAILABLE';

  constructor(code: GoClawClientError['code']) {
    super(code);
    this.name = 'GoClawClientError';
    this.code = code;
  }
}

export interface GoClawClientOptions {
  baseUrl: string;
  webhookId: string;
  signingKey: string;
  contract: string;
  timeoutMs: number;
  nowSeconds?: () => number;
  fetchImplementation?: typeof fetch;
  allowInsecureLoopback?: boolean;
}

function validateBaseUrl(raw: string, allowInsecureLoopback = false): string {
  const url = new URL(raw);
  const loopback = url.hostname === 'localhost' || url.hostname === '127.0.0.1' || url.hostname === '[::1]';
  if (url.protocol !== 'https:' && !(allowInsecureLoopback && loopback && url.protocol === 'http:')) {
    throw new Error('GoClaw URL must use HTTPS');
  }
  if (url.username || url.password || url.search || url.hash) {
    throw new Error('invalid GoClaw URL');
  }
  const path = url.pathname.replace(/\/+$/, '');
  if (path !== '') throw new Error('GoClaw URL must not contain a path');
  return url.origin;
}

async function readBoundedJson(response: Response): Promise<unknown> {
  if (!response.headers.get('content-type')?.toLowerCase().startsWith('application/json')) {
    throw new GoClawClientError('UPSTREAM_UNAVAILABLE');
  }
  const reader = response.body?.getReader();
  if (!reader) throw new GoClawClientError('UPSTREAM_UNAVAILABLE');
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > MAX_RESPONSE_BYTES) {
      await reader.cancel();
      throw new GoClawClientError('UPSTREAM_UNAVAILABLE');
    }
    chunks.push(value);
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  try {
    return JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes));
  } catch {
    throw new GoClawClientError('UPSTREAM_UNAVAILABLE');
  }
}

export function createGoClawWebhookClient(options: GoClawClientOptions): GoClawClient {
  if (options.contract !== GOCLAW_CONTRACT) throw new Error('invalid GoClaw contract');
  const baseUrl = validateBaseUrl(options.baseUrl, options.allowInsecureLoopback);
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(options.webhookId)) {
    throw new Error('invalid GoClaw webhook id');
  }
  // Stable v3.14.0 create/rotate returns the raw one-time webhook secret as
  // hmac_signing_key. GoClaw verifies HMAC with its UTF-8 bytes (not secret_hash).
  if (!/^wh_[A-Z2-7]{39}$/.test(options.signingKey)) {
    throw new Error('invalid GoClaw signing key');
  }
  if (!Number.isSafeInteger(options.timeoutMs) || options.timeoutMs < 1 || options.timeoutMs > 30_000) {
    throw new Error('invalid GoClaw timeout');
  }
  const signingKey = Buffer.from(options.signingKey, 'utf8');
  const nowSeconds = options.nowSeconds ?? (() => Math.floor(Date.now() / 1_000));
  const fetchImplementation = options.fetchImplementation ?? fetch;

  return {
    async reply(input) {
      const body = JSON.stringify({
        input: input.message,
        session_key: input.sessionKey,
        mode: 'sync',
        // Including the opaque turn ID prevents two legitimate identical
        // prompts in the same second from producing the same HMAC nonce.
        metadata: { source: 'htlabs-landing', request_id: input.idempotencyKey },
      });
      const timestamp = nowSeconds();
      const signature = createHmac('sha256', signingKey)
        .update(`${timestamp}.`)
        .update(body)
        .digest('hex');
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), options.timeoutMs);
      let response: Response;
      try {
        response = await fetchImplementation(`${baseUrl}/v1/webhooks/llm`, {
          method: 'POST',
          redirect: 'error',
          headers: {
            accept: 'application/json',
            'content-type': 'application/json',
            'x-webhook-id': options.webhookId,
            'x-goclaw-signature': `t=${timestamp},v1=${signature}`,
            'idempotency-key': input.idempotencyKey,
          },
          body,
          signal: controller.signal,
        });
      } catch (error) {
        if (controller.signal.aborted || (error instanceof DOMException && error.name === 'AbortError')) {
          throw new GoClawClientError('UPSTREAM_TIMEOUT');
        }
        throw new GoClawClientError('UPSTREAM_UNAVAILABLE');
      } finally {
        clearTimeout(timeout);
      }
      if (!response.ok) throw new GoClawClientError('UPSTREAM_UNAVAILABLE');
      const parsed = await readBoundedJson(response);
      if (!parsed || typeof parsed !== 'object') {
        throw new GoClawClientError('UPSTREAM_UNAVAILABLE');
      }
      const output = (parsed as Record<string, unknown>).output;
      if (typeof output !== 'string') throw new GoClawClientError('UPSTREAM_UNAVAILABLE');
      const message = output.trim();
      if (!message || Array.from(message).length > MAX_OUTPUT_CHARACTERS) {
        throw new GoClawClientError('UPSTREAM_UNAVAILABLE');
      }
      return { message };
    },
  };
}
