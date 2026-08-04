import { describe, expect, it, vi } from 'vitest';

import { createUpstashStores } from './upstash-rest';

describe('Upstash REST distributed controls', () => {
  it('uses atomic server-side scripts and bearer auth without exposing values in URLs', async () => {
    const fetchImplementation = vi.fn(async (_input: string | URL | Request, _init?: RequestInit) =>
      new Response(JSON.stringify({ result: [1, 0] }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }),
    );
    const stores = createUpstashStores({
      url: 'https://redis.example',
      token: 'server-secret',
      namespace: 'htlabs-test',
      fetchImplementation,
    });
    await expect(stores.rateLimiter.consume('network:opaque', 10, 60)).resolves.toEqual({
      allowed: true,
      retryAfterSeconds: 0,
    });
    const [url, init] = fetchImplementation.mock.calls[0];
    expect(url).toBe('https://redis.example');
    expect(new Headers(init?.headers).get('authorization')).toBe('Bearer server-secret');
    const command = JSON.parse(String(init?.body));
    expect(command[0]).toBe('EVAL');
    expect(command).toContain('htlabs-test:rate:network:opaque');
  });

  it('fails closed on Redis protocol errors', async () => {
    const stores = createUpstashStores({
      url: 'https://redis.example',
      token: 'server-secret',
      namespace: 'htlabs-test',
      fetchImplementation: vi.fn(async (_input: string | URL | Request, _init?: RequestInit) => new Response('{"error":"down"}', { status: 500 })),
    });
    await expect(stores.rateLimiter.consume('global', 10, 60)).rejects.toThrow(
      'rate limit store unavailable',
    );
  });

  it('uses a caller-bounded pending lease instead of the completed replay TTL', async () => {
    const fetchImplementation = vi.fn(async (_input: string | URL | Request, _init?: RequestInit) =>
      new Response(JSON.stringify({ result: 'NEW' }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }),
    );
    const stores = createUpstashStores({
      url: 'https://redis.example',
      token: 'server-secret',
      namespace: 'htlabs-test',
      fetchImplementation,
    });
    await expect(stores.idempotency.begin('4af89e0d-e5ff-4d98-8ba4-5b6528715305', 'aa'.repeat(32), 45))
      .resolves.toEqual({ state: 'new' });
    const command = JSON.parse(String(fetchImplementation.mock.calls[0][1]?.body));
    expect(command.at(-1)).toBe('45');
  });

  it('aborts stalled requests and rejects oversized responses', async () => {
    const stalled = createUpstashStores({
      url: 'https://redis.example',
      token: 'server-secret',
      namespace: 'htlabs-test',
      timeoutMs: 5,
      fetchImplementation: vi.fn(async (_input, init) => {
        await new Promise((_resolve, reject) => {
          init?.signal?.addEventListener('abort', () => reject(new DOMException('aborted', 'AbortError')));
        });
        return new Response();
      }),
    });
    await expect(stalled.rateLimiter.consume('global', 10, 60)).rejects.toThrow(
      'rate limit store unavailable',
    );

    const oversized = createUpstashStores({
      url: 'https://redis.example',
      token: 'server-secret',
      namespace: 'htlabs-test',
      fetchImplementation: vi.fn(async () => new Response('a'.repeat(16_385), { status: 200 })),
    });
    await expect(oversized.rateLimiter.consume('global', 10, 60)).rejects.toThrow(
      'rate limit store unavailable',
    );
  });
});
