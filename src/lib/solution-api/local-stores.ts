import type {
  IdempotencyStore,
  RateLimiter,
  SolutionReply,
} from './solution-api';

interface RateEntry {
  count: number;
  expiresAt: number;
}

interface IdempotencyEntry {
  bodyDigest: string;
  expiresAt: number;
  response?: SolutionReply;
}

const MAX_ENTRIES = 10_000;

export function createLocalStores(now: () => number = Date.now): {
  rateLimiter: RateLimiter;
  idempotency: IdempotencyStore;
} {
  const rates = new Map<string, RateEntry>();
  const requests = new Map<string, IdempotencyEntry>();

  function makeRoom<T extends { expiresAt: number }>(store: Map<string, T>): void {
    if (store.size < MAX_ENTRIES) return;
    const current = now();
    for (const [key, value] of store) {
      if (value.expiresAt <= current) store.delete(key);
    }
    if (store.size >= MAX_ENTRIES) throw new Error('local store capacity exceeded');
  }

  const rateLimiter: RateLimiter = {
    async consume(key, limit, windowSeconds) {
      const current = now();
      let entry = rates.get(key);
      if (!entry || entry.expiresAt <= current) {
        makeRoom(rates);
        entry = { count: 0, expiresAt: current + windowSeconds * 1_000 };
        rates.set(key, entry);
      }
      entry.count += 1;
      return {
        allowed: entry.count <= limit,
        retryAfterSeconds: entry.count <= limit
          ? 0
          : Math.max(1, Math.ceil((entry.expiresAt - current) / 1_000)),
      };
    },
  };

  const idempotency: IdempotencyStore = {
    async begin(key, bodyDigest, ttlSeconds) {
      const current = now();
      const existing = requests.get(key);
      if (existing && existing.expiresAt > current) {
        if (existing.bodyDigest !== bodyDigest) return { state: 'conflict' };
        if (existing.response) return { state: 'replay', response: existing.response };
        return { state: 'pending' };
      }
      if (existing) requests.delete(key);
      makeRoom(requests);
      requests.set(key, {
        bodyDigest,
        expiresAt: current + ttlSeconds * 1_000,
      });
      return { state: 'new' };
    },
    async complete(key, bodyDigest, response, ttlSeconds) {
      const existing = requests.get(key);
      if (!existing || existing.bodyDigest !== bodyDigest || existing.expiresAt <= now()) {
        throw new Error('local idempotency reservation unavailable');
      }
      existing.response = response;
      existing.expiresAt = now() + ttlSeconds * 1_000;
    },
  };

  return { rateLimiter, idempotency };
}
