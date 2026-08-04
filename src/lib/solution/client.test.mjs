import assert from 'node:assert/strict';
import test from 'node:test';

import {
  SOLUTION_PROMPT_MAX_LENGTH,
  SOLUTION_REPLY_MAX_LENGTH,
  SOLUTION_TRANSFER_KEY,
  consumeSolutionTransfer,
  createTurnIdempotencyKey,
  isSolutionChatPubliclyEnabled,
  normalizeSolutionPrompt,
  requestSolutionReply,
  writeSolutionTransfer,
} from './client.ts';

function memoryStorage(initial = {}) {
  const values = new Map(Object.entries(initial));
  return {
    getItem(key) {
      return values.get(key) ?? null;
    },
    removeItem(key) {
      values.delete(key);
    },
    setItem(key, value) {
      values.set(key, value);
    },
  };
}

test('normalizes a valid prompt and enforces the public length boundary', () => {
  assert.equal(normalizeSolutionPrompt('  Tôi cần CRM AI  '), 'Tôi cần CRM AI');
  assert.throws(() => normalizeSolutionPrompt('   '), /required/i);
  assert.throws(
    () => normalizeSolutionPrompt('a'.repeat(SOLUTION_PROMPT_MAX_LENGTH + 1)),
    /too_long/i,
  );
});

test('enables the public experience only for the exact string true', () => {
  assert.equal(isSolutionChatPubliclyEnabled('true'), true);
  for (const value of ['TRUE', '1', 'yes', ' true ', '', undefined]) {
    assert.equal(isSolutionChatPubliclyEnabled(value), false);
  }
});

test('writes a versioned transfer and consumes it exactly once', () => {
  const storage = memoryStorage();
  writeSolutionTransfer(storage, '  Tự động hóa bán hàng  ', 1_000);

  assert.equal(
    storage.getItem(SOLUTION_TRANSFER_KEY),
    JSON.stringify({ version: 1, prompt: 'Tự động hóa bán hàng', createdAt: 1_000 }),
  );
  assert.equal(consumeSolutionTransfer(storage, 1_001), 'Tự động hóa bán hàng');
  assert.equal(consumeSolutionTransfer(storage, 1_002), null);
});

test('clears malformed, expired, future-dated, and overlong transfers', () => {
  const invalidValues = [
    '{',
    JSON.stringify({ version: 2, prompt: 'hello', createdAt: 1_000 }),
    JSON.stringify({ version: 1, prompt: 'hello', createdAt: 1_000 }),
    JSON.stringify({ version: 1, prompt: 'hello', createdAt: 10_000_000 }),
    JSON.stringify({
      version: 1,
      prompt: 'a'.repeat(SOLUTION_PROMPT_MAX_LENGTH + 1),
      createdAt: 1_000,
    }),
  ];

  for (const [index, value] of invalidValues.entries()) {
    const storage = memoryStorage({ [SOLUTION_TRANSFER_KEY]: value });
    const now = index === 2 ? 1_000 + 5 * 60 * 1_000 + 1 : 2_000;
    assert.equal(consumeSolutionTransfer(storage, now), null);
    assert.equal(storage.getItem(SOLUTION_TRANSFER_KEY), null);
  }
});

test('requests a solution through the same-origin API without putting content in a URL', async () => {
  const calls = [];
  const response = await requestSolutionReply(
    {
      message: 'Tối ưu quy trình',
      conversationId: 'conv_123',
      idempotencyKey: '123e4567-e89b-42d3-a456-426614174000',
    },
    async (url, init) => {
      calls.push({ url, init });
      return new Response(
        JSON.stringify({ message: 'Đây là đề xuất.', conversationId: 'conv_123' }),
        { status: 200, headers: { 'content-type': 'application/json' } },
      );
    },
  );

  assert.deepEqual(response, {
    message: 'Đây là đề xuất.',
    conversationId: 'conv_123',
  });
  assert.equal(calls[0].url, '/api/solution-chat');
  assert.equal(calls[0].init.method, 'POST');
  assert.equal(calls[0].init.credentials, 'same-origin');
  assert.equal(calls[0].init.headers['idempotency-key'], '123e4567-e89b-42d3-a456-426614174000');
  assert.deepEqual(JSON.parse(calls[0].init.body), {
    message: 'Tối ưu quy trình',
    conversationId: 'conv_123',
  });
});

test('maps non-successful and malformed API responses to safe client errors', async () => {
  await assert.rejects(
    requestSolutionReply({ message: 'hello', idempotencyKey: '123e4567-e89b-42d3-a456-426614174000' }, async () =>
      new Response(JSON.stringify({ error: { code: 'RATE_LIMITED' } }), {
        status: 429,
        headers: { 'content-type': 'application/json' },
      }),
    ),
    (error) => error.code === 'RATE_LIMITED' && error.status === 429,
  );

  await assert.rejects(
    requestSolutionReply({ message: 'hello', idempotencyKey: '123e4567-e89b-42d3-a456-426614174000' }, async () =>
      new Response(JSON.stringify({ message: '<b>unsafe</b>' }), { status: 200 }),
    ),
    (error) => error.code === 'INVALID_RESPONSE',
  );
});

test('enforces the HTLabs assistant reply limit defensively', async () => {
  assert.equal(SOLUTION_REPLY_MAX_LENGTH, 300);
  await assert.rejects(
    requestSolutionReply(
      { message: 'hello', idempotencyKey: '123e4567-e89b-42d3-a456-426614174000' },
      async () => new Response(
        JSON.stringify({
          message: 'a'.repeat(301),
          conversationId: 'conv_123',
        }),
        { status: 200, headers: { 'content-type': 'application/json' } },
      ),
    ),
    (error) => error.code === 'INVALID_RESPONSE',
  );
});

test('creates a UUID idempotency key once per immutable turn', () => {
  assert.equal(
    createTurnIdempotencyKey({ randomUUID: () => '123e4567-e89b-42d3-a456-426614174000' }),
    '123e4567-e89b-42d3-a456-426614174000',
  );
});
