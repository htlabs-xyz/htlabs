import { describe, expect, it, vi } from 'vitest';

import {
  createConversationToken,
  createSessionCookie,
  handleSolutionChat,
  parseConversationToken,
  parseSessionCookie,
  type SolutionApiDependencies,
} from './solution-api';

const secret = new Uint8Array(32).fill(7);
const now = new Date('2026-08-04T12:00:00.000Z');

function dependencies(
  overrides: Partial<SolutionApiDependencies> = {},
): SolutionApiDependencies {
  return {
    enabled: true,
    allowedOrigins: new Set(['https://htlabs.example']),
    sessionSecret: secret,
    sessionTtlSeconds: 3600,
    now: () => now,
    clientAddress: '203.0.113.5',
    rateLimiter: {
      consume: vi.fn(async () => ({ allowed: true, retryAfterSeconds: 0 })),
    },
    idempotency: {
      begin: vi.fn(async () => ({ state: 'new' as const })),
      complete: vi.fn(async () => undefined),
    },
    goclaw: {
      reply: vi.fn(async () => ({ message: 'Giải pháp phù hợp.' })),
    },
    ...overrides,
  };
}

function post(body: unknown, headers: Record<string, string> = {}): Request {
  const serialized = JSON.stringify(body);
  return new Request('https://htlabs.example/api/solution-chat', {
    method: 'POST',
    headers: {
      origin: 'https://htlabs.example',
      'content-type': 'application/json',
      'content-length': String(Buffer.byteLength(serialized)),
      'idempotency-key': '4af89e0d-e5ff-4d98-8ba4-5b6528715305',
      ...headers,
    },
    body: serialized,
  });
}

describe('anonymous session and conversation capabilities', () => {
  it('round-trips a signed session and rejects tampering', async () => {
    const cookie = await createSessionCookie('anonymous-id', 1_775_000_000, secret);
    await expect(parseSessionCookie(cookie, secret, 1_774_999_999)).resolves.toEqual({
      id: 'anonymous-id',
      expiresAt: 1_775_000_000,
    });
    await expect(
      parseSessionCookie(`${cookie.slice(0, -1)}x`, secret, 1_774_999_999),
    ).resolves.toBeNull();
  });

  it('binds opaque conversation tokens to the server-issued session', async () => {
    const token = await createConversationToken('anon-a', new Uint8Array(16).fill(3), secret);
    expect(token).toMatch(/^[A-Za-z0-9_-]{1,128}$/);
    await expect(parseConversationToken(token, 'anon-a', secret)).resolves.toBeTruthy();
    await expect(parseConversationToken(token, 'anon-b', secret)).resolves.toBeNull();
  });
});

describe('solution API boundary', () => {
  it('is disabled unless the kill switch was parsed as exact true', async () => {
    const response = await handleSolutionChat(post({ message: 'Xin chào' }), dependencies({ enabled: false }));
    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toEqual({ error: { code: 'SERVICE_UNAVAILABLE' } });
  });

  it.each([
    ['foreign origin', { origin: 'https://evil.example' }, 403],
    ['compressed body', { 'content-encoding': 'gzip' }, 415],
    ['wrong media type', { 'content-type': 'text/plain' }, 415],
    ['oversized body', { 'content-length': '9000' }, 413],
  ])('rejects %s before invoking GoClaw', async (_label, headers, status) => {
    const deps = dependencies();
    const response = await handleSolutionChat(post({ message: 'Xin chào' }, headers), deps);
    expect(response.status).toBe(status);
    expect(deps.goclaw.reply).not.toHaveBeenCalled();
  });

  it('accepts only the bounded allowlisted JSON contract', async () => {
    const deps = dependencies();
    const response = await handleSolutionChat(
      post({ message: '  Xin chào  ', unexpected: true }),
      deps,
    );
    expect(response.status).toBe(400);
    expect(deps.goclaw.reply).not.toHaveBeenCalled();
  });

  it('creates server-owned identities and returns an opaque conversation capability', async () => {
    const deps = dependencies();
    const response = await handleSolutionChat(post({ message: '  Xin chào  ' }), deps);
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body).toEqual({
      message: 'Giải pháp phù hợp.',
      conversationId: expect.stringMatching(/^[A-Za-z0-9_-]{1,128}$/),
    });
    expect(response.headers.get('set-cookie')).toContain(
      '__Host-htlabs_solution_session=',
    );
    expect(response.headers.get('set-cookie')).toContain('HttpOnly');
    expect(response.headers.get('set-cookie')).toContain('Secure');
    expect(response.headers.get('set-cookie')).toContain('SameSite=Lax');
    expect(deps.goclaw.reply).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Xin chào',
        sessionKey: expect.stringMatching(/^htlabs_solution_/),
      }),
    );
  });

  it('uses a separate non-Secure cookie only for local preview', async () => {
    const response = await handleSolutionChat(
      post({ message: 'Xin chào' }),
      dependencies({ secureCookies: false }),
    );
    expect(response.status).toBe(200);
    expect(response.headers.get('set-cookie')).toContain('htlabs_solution_session_dev=');
    expect(response.headers.get('set-cookie')).not.toContain('__Host-');
    expect(response.headers.get('set-cookie')).not.toContain('; Secure');
    expect(response.headers.get('set-cookie')).toContain('HttpOnly');
    expect(response.headers.get('set-cookie')).toContain('SameSite=Lax');
  });

  it('rejects a conversation token copied from another anonymous session', async () => {
    const firstDeps = dependencies();
    const first = await handleSolutionChat(post({ message: 'Một' }), firstDeps);
    const { conversationId } = await first.json();

    const secondDeps = dependencies();
    const response = await handleSolutionChat(
      post(
        { message: 'Hai', conversationId },
        { 'idempotency-key': '79ae416e-f4d0-4d46-a690-6ee4973d56bb' },
      ),
      secondDeps,
    );
    expect(response.status).toBe(400);
    expect(secondDeps.goclaw.reply).not.toHaveBeenCalled();
  });

  it('fails closed when the distributed limiter is unavailable', async () => {
    const deps = dependencies({
      rateLimiter: { consume: vi.fn(async () => { throw new Error('redis down'); }) },
    });
    const response = await handleSolutionChat(post({ message: 'Xin chào' }), deps);
    expect(response.status).toBe(503);
    expect(deps.goclaw.reply).not.toHaveBeenCalled();
  });

  it('enforces the HTLabs skill response limit of 300 Unicode characters', async () => {
    const deps = dependencies({
      goclaw: { reply: vi.fn(async () => ({ message: 'a'.repeat(301) })) },
    });
    const response = await handleSolutionChat(post({ message: 'Xin chào' }), deps);
    expect(response.status).toBe(502);
    await expect(response.json()).resolves.toEqual({
      error: { code: 'UPSTREAM_UNAVAILABLE' },
    });
  });

  it('rejects assistant output containing more than one question', async () => {
    const deps = dependencies({
      goclaw: { reply: vi.fn(async () => ({ message: 'Anh/chị cần CRM? Quy mô đội ngũ là bao nhiêu?' })) },
    });
    const response = await handleSolutionChat(post({ message: 'Xin chào' }), deps);
    expect(response.status).toBe(502);
    await expect(response.json()).resolves.toEqual({
      error: { code: 'UPSTREAM_UNAVAILABLE' },
    });
  });

  it('sets the anonymous cookie even when the first upstream attempt fails', async () => {
    const deps = dependencies({
      goclaw: { reply: vi.fn(async () => { throw new Error('private upstream detail'); }) },
    });
    const response = await handleSolutionChat(post({ message: 'Xin chào' }), deps);
    expect(response.status).toBe(502);
    expect(response.headers.get('set-cookie')).toContain('__Host-htlabs_solution_session=');
    expect(await response.text()).not.toContain('private upstream detail');
    expect(deps.idempotency.begin).toHaveBeenCalledWith(
      '4af89e0d-e5ff-4d98-8ba4-5b6528715305',
      expect.stringMatching(/^[0-9a-f]{64}$/),
      45,
    );
  });

  it('recovers a no-cookie first turn after response loss without forking identity', async () => {
    const upstream = vi
      .fn()
      .mockRejectedValueOnce(new Error('temporary'))
      .mockResolvedValueOnce({ message: 'Đã phục hồi' });
    const firstDeps = dependencies({ goclaw: { reply: upstream } });
    const first = await handleSolutionChat(post({ message: 'Xin chào' }), firstDeps);
    expect(first.status).toBe(502);
    expect(first.headers.get('set-cookie')).toBeTruthy();
    const firstIdentity = upstream.mock.calls[0][0];

    // Simulate total response loss: retry has neither cookie nor conversationId.
    // The fake store returns "new" again to model expiration of the 45s pending lease.
    const retryDeps = dependencies({ goclaw: { reply: upstream } });
    const retry = await handleSolutionChat(
      post({ message: 'Xin chào' }),
      retryDeps,
    );
    expect(retry.status).toBe(200);
    expect(upstream.mock.calls[1][0]).toEqual(firstIdentity);
  });

  it('replays a completed idempotent result without a second upstream call', async () => {
    let completed: { message: string; conversationId: string } | undefined;
    const firstDeps = dependencies({
      idempotency: {
        begin: vi.fn(async () => ({ state: 'new' as const })),
        complete: vi.fn(async (_key, _digest, response) => { completed = response }),
      },
    });
    const first = await handleSolutionChat(post({ message: 'Xin chào' }), firstDeps);
    expect(first.status).toBe(200);
    const firstBody = await first.json() as { message: string; conversationId: string };
    const cookie = first.headers.get('set-cookie')?.split(';', 1)[0];
    expect(completed).toEqual(firstBody);

    const deps = dependencies({
      idempotency: {
        begin: vi.fn(async () => ({ state: 'replay' as const, response: completed! })),
        complete: vi.fn(async () => undefined),
      },
    });
    const response = await handleSolutionChat(
      post(
        { message: 'Xin chào', conversationId: firstBody.conversationId },
        { cookie: cookie! },
      ),
      deps,
    );
    expect(response.status).toBe(200);
    expect(response.headers.get('x-idempotency-replayed')).toBe('true');
    expect(deps.goclaw.reply).not.toHaveBeenCalled();
  });

  it.each([
    ['conflict', 409, 'IDEMPOTENCY_CONFLICT'],
    ['pending', 425, 'REQUEST_IN_PROGRESS'],
  ] as const)('fails safely for an idempotency %s', async (state, status, code) => {
    const deps = dependencies({
      idempotency: {
        begin: vi.fn(async () => ({ state })),
        complete: vi.fn(async () => undefined),
      },
    });
    const response = await handleSolutionChat(post({ message: 'Xin chào' }), deps);
    expect(response.status).toBe(status);
    await expect(response.json()).resolves.toEqual({ error: { code } });
    expect(deps.goclaw.reply).not.toHaveBeenCalled();
  });

  it('does not claim deletion when GoClaw has no verified delete contract', async () => {
    const request = new Request('https://htlabs.example/api/solution-chat', {
      method: 'DELETE',
      headers: { origin: 'https://htlabs.example' },
    });
    const response = await handleSolutionChat(request, dependencies());
    expect(response.status).toBe(501);
    await expect(response.json()).resolves.toEqual({
      error: { code: 'DELETION_UNAVAILABLE' },
    });
  });
});
