import { describe, expect, it } from 'vitest';

import { createRuntimeDependencies } from './runtime';

describe('solution runtime configuration', () => {
  it.each([undefined, '', 'TRUE', '1', ' true'])('stays disabled for non-exact flag %s', (flag) => {
    expect(createRuntimeDependencies({ SOLUTION_CHAT_ENABLED: flag }, undefined).enabled).toBe(false);
  });

  it('fails closed when an enabled deployment is incomplete', () => {
    expect(() => createRuntimeDependencies({ SOLUTION_CHAT_ENABLED: 'true' }, '203.0.113.1'))
      .toThrow('missing SOLUTION_SESSION_SECRET_HEX');
  });

  it('accepts only exact HTTPS origins and the pinned GoClaw contract', () => {
    const env = {
      SOLUTION_CHAT_ENABLED: 'true',
      SOLUTION_ALLOWED_ORIGINS: 'https://htlabs.example',
      SOLUTION_SESSION_SECRET_HEX: '22'.repeat(32),
      UPSTASH_REDIS_REST_URL: 'https://redis.example',
      UPSTASH_REDIS_REST_TOKEN: 'redis-secret',
      GOCLAW_BASE_URL: 'https://goclaw.example',
      GOCLAW_WEBHOOK_ID: '0cfe8fb2-0f93-4da9-b7a3-e28d61be5efe',
      GOCLAW_WEBHOOK_HMAC_KEY: `wh_${'A'.repeat(39)}`,
      GOCLAW_API_CONTRACT: 'goclaw-webhook-llm-hmac-v1@2f3d68e',
    };
    const deps = createRuntimeDependencies(env, '203.0.113.1');
    expect(deps.enabled).toBe(true);
    expect(deps.allowedOrigins).toEqual(new Set(['https://htlabs.example']));
    expect(() => createRuntimeDependencies({
      ...env,
      SOLUTION_ALLOWED_ORIGINS: 'https://htlabs.example/path',
    }, '203.0.113.1')).toThrow('invalid origins');
  });

  it('supports an explicit loopback-only local preview without Upstash', () => {
    const deps = createRuntimeDependencies({
      NODE_ENV: 'development',
      SOLUTION_CHAT_ENABLED: 'true',
      SOLUTION_CHAT_LOCAL_DEV: 'true',
      SOLUTION_ALLOWED_ORIGINS: 'http://localhost:4321',
      SOLUTION_SESSION_SECRET_HEX: '22'.repeat(32),
      GOCLAW_BASE_URL: 'http://127.0.0.1:18790',
      GOCLAW_WEBHOOK_ID: '0cfe8fb2-0f93-4da9-b7a3-e28d61be5efe',
      GOCLAW_WEBHOOK_HMAC_KEY: `wh_${'A'.repeat(39)}`,
      GOCLAW_API_CONTRACT: 'goclaw-webhook-llm-hmac-v1@2f3d68e',
    }, '127.0.0.1');
    expect(deps.enabled).toBe(true);
    expect(deps.allowedOrigins).toEqual(new Set(['http://localhost:4321']));
  });

  it('forbids local preview mode in production', () => {
    expect(() => createRuntimeDependencies({
      NODE_ENV: 'production',
      SOLUTION_CHAT_ENABLED: 'true',
      SOLUTION_CHAT_LOCAL_DEV: 'true',
    }, '127.0.0.1')).toThrow('local solution chat mode is forbidden in production');
  });
});
