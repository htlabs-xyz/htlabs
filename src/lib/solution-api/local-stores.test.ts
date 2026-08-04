import { describe, expect, it } from 'vitest';

import { createLocalStores } from './local-stores';

describe('local solution stores', () => {
  it('enforces a fixed-window limit and resets after expiry', async () => {
    let now = 1_000;
    const { rateLimiter } = createLocalStores(() => now);
    await expect(rateLimiter.consume('session:a', 1, 60)).resolves.toMatchObject({ allowed: true });
    await expect(rateLimiter.consume('session:a', 1, 60)).resolves.toMatchObject({
      allowed: false,
      retryAfterSeconds: 60,
    });
    now += 60_000;
    await expect(rateLimiter.consume('session:a', 1, 60)).resolves.toMatchObject({ allowed: true });
  });

  it('supports pending, conflict, completion, and replay states', async () => {
    let now = 1_000;
    const { idempotency } = createLocalStores(() => now);
    await expect(idempotency.begin('turn', 'digest-a', 45)).resolves.toEqual({ state: 'new' });
    await expect(idempotency.begin('turn', 'digest-a', 45)).resolves.toEqual({ state: 'pending' });
    await expect(idempotency.begin('turn', 'digest-b', 45)).resolves.toEqual({ state: 'conflict' });
    const response = { message: 'Xin chào', conversationId: 'conversation' };
    await idempotency.complete('turn', 'digest-a', response, 86_400);
    await expect(idempotency.begin('turn', 'digest-a', 45)).resolves.toEqual({
      state: 'replay',
      response,
    });
    now += 86_400_000;
    await expect(idempotency.begin('turn', 'digest-a', 45)).resolves.toEqual({ state: 'new' });
  });
});
