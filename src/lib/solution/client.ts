export const SOLUTION_PROMPT_MAX_LENGTH = 2_000;
export const SOLUTION_REPLY_MAX_LENGTH = 300;
export const SOLUTION_TRANSFER_KEY = 'htlabs:solution-transfer:v1';
export const SOLUTION_TRANSFER_TTL_MS = 5 * 60 * 1_000;

const TRANSFER_VERSION = 1;
const CONVERSATION_ID_PATTERN = /^[A-Za-z0-9_-]{1,128}$/;
const IDEMPOTENCY_KEY_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export interface StorageLike {
  getItem(key: string): string | null;
  removeItem(key: string): void;
  setItem(key: string, value: string): void;
}

export interface SolutionReply {
  message: string;
  conversationId: string;
}

export class SolutionClientError extends Error {
  code: string;
  status: number;

  constructor(code: string, status = 0) {
    super(code);
    this.name = 'SolutionClientError';
    this.code = code;
    this.status = status;
  }
}

export function isSolutionChatPubliclyEnabled(value: unknown): boolean {
  return value === 'true';
}

export function normalizeSolutionPrompt(value: unknown): string {
  if (typeof value !== 'string') {
    throw new SolutionClientError('PROMPT_REQUIRED');
  }

  const prompt = value.trim();
  if (!prompt) throw new SolutionClientError('PROMPT_REQUIRED');
  if (Array.from(prompt).length > SOLUTION_PROMPT_MAX_LENGTH) {
    throw new SolutionClientError('PROMPT_TOO_LONG');
  }
  return prompt;
}

export function writeSolutionTransfer(
  storage: StorageLike,
  value: unknown,
  now = Date.now(),
): void {
  const prompt = normalizeSolutionPrompt(value);
  storage.setItem(
    SOLUTION_TRANSFER_KEY,
    JSON.stringify({ version: TRANSFER_VERSION, prompt, createdAt: now }),
  );
}

export function consumeSolutionTransfer(
  storage: StorageLike,
  now = Date.now(),
): string | null {
  const serialized = storage.getItem(SOLUTION_TRANSFER_KEY);
  storage.removeItem(SOLUTION_TRANSFER_KEY);
  if (!serialized) return null;

  try {
    const transfer = JSON.parse(serialized) as Record<string, unknown>;
    if (
      transfer.version !== TRANSFER_VERSION ||
      typeof transfer.createdAt !== 'number' ||
      !Number.isSafeInteger(transfer.createdAt) ||
      transfer.createdAt > now ||
      now - transfer.createdAt > SOLUTION_TRANSFER_TTL_MS
    ) {
      return null;
    }
    return normalizeSolutionPrompt(transfer.prompt);
  } catch {
    return null;
  }
}

export function createTurnIdempotencyKey(
  cryptoImplementation: Pick<Crypto, 'randomUUID'> = crypto,
): string {
  const key = cryptoImplementation.randomUUID();
  if (!IDEMPOTENCY_KEY_PATTERN.test(key)) {
    throw new SolutionClientError('IDEMPOTENCY_UNAVAILABLE');
  }
  return key;
}

function parseReply(value: unknown): SolutionReply {
  if (!value || typeof value !== 'object') {
    throw new SolutionClientError('INVALID_RESPONSE');
  }

  const candidate = value as Record<string, unknown>;
  if (
    typeof candidate.message !== 'string' ||
    !candidate.message.trim() ||
    Array.from(candidate.message).length > SOLUTION_REPLY_MAX_LENGTH ||
    typeof candidate.conversationId !== 'string' ||
    !CONVERSATION_ID_PATTERN.test(candidate.conversationId)
  ) {
    throw new SolutionClientError('INVALID_RESPONSE');
  }

  return {
    message: candidate.message.trim(),
    conversationId: candidate.conversationId,
  };
}

async function readJson(response: Response): Promise<unknown> {
  const contentType = response.headers.get('content-type') ?? '';
  if (!contentType.toLowerCase().includes('application/json')) return null;
  try {
    return await response.json();
  } catch {
    return null;
  }
}

export async function requestSolutionReply(
  input: { message: unknown; conversationId?: string; idempotencyKey: string },
  fetchImplementation: typeof fetch = fetch,
  signal?: AbortSignal,
): Promise<SolutionReply> {
  const message = normalizeSolutionPrompt(input.message);
  if (
    input.conversationId !== undefined &&
    !CONVERSATION_ID_PATTERN.test(input.conversationId)
  ) {
    throw new SolutionClientError('INVALID_CONVERSATION');
  }
  if (!IDEMPOTENCY_KEY_PATTERN.test(input.idempotencyKey)) {
    throw new SolutionClientError('INVALID_IDEMPOTENCY_KEY');
  }

  let response: Response;
  try {
    response = await fetchImplementation('/api/solution-chat', {
      method: 'POST',
      credentials: 'same-origin',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        'idempotency-key': input.idempotencyKey,
      },
      body: JSON.stringify({
        message,
        ...(input.conversationId ? { conversationId: input.conversationId } : {}),
      }),
      signal,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') throw error;
    throw new SolutionClientError('NETWORK_ERROR');
  }

  const body = await readJson(response);
  if (!response.ok) {
    const remoteCode =
      body && typeof body === 'object'
        ? (body as { error?: { code?: unknown } }).error?.code
        : undefined;
    const code =
      typeof remoteCode === 'string' && /^[A-Z0-9_]{1,64}$/.test(remoteCode)
        ? remoteCode
        : 'REQUEST_FAILED';
    throw new SolutionClientError(code, response.status);
  }

  return parseReply(body);
}
