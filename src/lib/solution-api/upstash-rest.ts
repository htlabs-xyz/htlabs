import type {
  IdempotencyStore,
  RateLimiter,
  SolutionReply,
} from './solution-api';

interface UpstashOptions {
  url: string;
  token: string;
  namespace: string;
  timeoutMs?: number;
  fetchImplementation?: typeof fetch;
}

const DEFAULT_TIMEOUT_MS = 3_000;
const MAX_RESPONSE_BYTES = 16_384;

const RATE_SCRIPT = `
local n = redis.call('INCR', KEYS[1])
if n == 1 then redis.call('EXPIRE', KEYS[1], ARGV[1]) end
local ttl = redis.call('TTL', KEYS[1])
return {n, ttl}`.trim();

const IDEMPOTENCY_BEGIN_SCRIPT = `
local existing = redis.call('GET', KEYS[1])
if existing then return existing end
redis.call('SET', KEYS[1], ARGV[1], 'EX', ARGV[2], 'NX')
return 'NEW'`.trim();

const IDEMPOTENCY_COMPLETE_SCRIPT = `
local existing = redis.call('GET', KEYS[1])
if not existing then return 0 end
local decoded = cjson.decode(existing)
if decoded.h ~= ARGV[1] then return -1 end
redis.call('SET', KEYS[1], ARGV[2], 'EX', ARGV[3], 'XX')
return 1`.trim();

function safePart(value: string): string {
  if (!/^[A-Za-z0-9:_-]{1,200}$/.test(value)) throw new Error('invalid store key');
  return value;
}

export function createUpstashStores(options: UpstashOptions): {
  rateLimiter: RateLimiter;
  idempotency: IdempotencyStore;
} {
  const url = new URL(options.url);
  if (url.protocol !== 'https:' || url.pathname !== '/' || url.search || url.hash) {
    throw new Error('invalid Redis REST URL');
  }
  if (!options.token || options.token.length > 2_048) throw new Error('invalid Redis token');
  const namespace = safePart(options.namespace);
  const fetchImplementation = options.fetchImplementation ?? fetch;
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  if (!Number.isSafeInteger(timeoutMs) || timeoutMs < 1 || timeoutMs > 10_000) {
    throw new Error('invalid Redis timeout');
  }

  async function execute(command: unknown[]): Promise<unknown> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetchImplementation(url.origin, {
        method: 'POST',
        redirect: 'error',
        signal: controller.signal,
        headers: {
          authorization: `Bearer ${options.token}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify(command),
      });
      if (!response.ok || !response.body) throw new Error();
      const reader = response.body.getReader();
      const chunks: Uint8Array[] = [];
      let size = 0;
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        size += value.byteLength;
        if (size > MAX_RESPONSE_BYTES) {
          await reader.cancel();
          throw new Error();
        }
        chunks.push(value);
      }
      const bytes = new Uint8Array(size);
      let offset = 0;
      for (const chunk of chunks) {
        bytes.set(chunk, offset);
        offset += chunk.byteLength;
      }
      const parsed = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes)) as unknown;
      if (!parsed || typeof parsed !== 'object' || !('result' in parsed)) {
        throw new Error();
      }
      return (parsed as { result: unknown }).result;
    } catch {
      throw new Error('distributed store unavailable');
    } finally {
      clearTimeout(timeout);
    }
  }

  const rateLimiter: RateLimiter = {
    async consume(key, limit, windowSeconds) {
      try {
        const result = await execute([
          'EVAL',
          RATE_SCRIPT,
          '1',
          `${namespace}:rate:${safePart(key)}`,
          String(windowSeconds),
        ]);
        if (!Array.isArray(result) || result.length !== 2) throw new Error();
        const count = Number(result[0]);
        const ttl = Math.max(1, Number(result[1]));
        if (!Number.isSafeInteger(count) || !Number.isFinite(ttl)) throw new Error();
        return { allowed: count <= limit, retryAfterSeconds: count <= limit ? 0 : ttl };
      } catch {
        throw new Error('rate limit store unavailable');
      }
    },
  };

  const idempotency: IdempotencyStore = {
    async begin(key, bodyDigest, ttlSeconds) {
      try {
        const redisKey = `${namespace}:idempotency:${safePart(key)}`;
        const pending = JSON.stringify({ h: bodyDigest, s: 'pending' });
        const result = await execute([
          'EVAL', IDEMPOTENCY_BEGIN_SCRIPT, '1', redisKey, pending, String(ttlSeconds),
        ]);
        if (result === 'NEW') return { state: 'new' };
        if (typeof result !== 'string') throw new Error();
        const stored = JSON.parse(result) as { h?: unknown; s?: unknown; r?: unknown };
        if (stored.h !== bodyDigest) return { state: 'conflict' };
        if (stored.s === 'pending') return { state: 'pending' };
        if (
          stored.s === 'done' && stored.r && typeof stored.r === 'object' &&
          typeof (stored.r as SolutionReply).message === 'string' &&
          typeof (stored.r as SolutionReply).conversationId === 'string'
        ) {
          return { state: 'replay', response: stored.r as SolutionReply };
        }
        throw new Error();
      } catch (error) {
        if (error && typeof error === 'object' && 'state' in error) throw error;
        throw new Error('idempotency store unavailable');
      }
    },
    async complete(key, bodyDigest, response, ttlSeconds) {
      try {
        const done = JSON.stringify({ h: bodyDigest, s: 'done', r: response });
        const result = await execute([
          'EVAL', IDEMPOTENCY_COMPLETE_SCRIPT, '1',
          `${namespace}:idempotency:${safePart(key)}`,
          bodyDigest,
          done,
          String(ttlSeconds),
        ]);
        if (result !== 1) throw new Error();
      } catch {
        throw new Error('idempotency store unavailable');
      }
    },
  };

  return { rateLimiter, idempotency };
}
