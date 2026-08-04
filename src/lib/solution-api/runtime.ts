import { createGoClawWebhookClient } from './goclaw-client';
import { createLocalStores } from './local-stores';
import type { SolutionApiDependencies } from './solution-api';
import { createUpstashStores } from './upstash-rest';

type Environment = Record<string, string | undefined>;

function required(env: Environment, name: string): string {
  const value = env[name];
  if (!value) throw new Error(`missing ${name}`);
  return value;
}

function parseInteger(
  env: Environment,
  name: string,
  fallback: number,
  minimum: number,
  maximum: number,
): number {
  const raw = env[name];
  if (raw === undefined || raw === '') return fallback;
  if (!/^\d+$/.test(raw)) throw new Error(`invalid ${name}`);
  const value = Number(raw);
  if (!Number.isSafeInteger(value) || value < minimum || value > maximum) {
    throw new Error(`invalid ${name}`);
  }
  return value;
}

function parseOrigins(raw: string, allowInsecureLoopback = false): Set<string> {
  const values = raw.split(',');
  if (values.length < 1 || values.length > 10) throw new Error('invalid origins');
  const origins = new Set<string>();
  for (const value of values) {
    if (!value || value !== value.trim()) throw new Error('invalid origins');
    const url = new URL(value);
    const loopback = url.hostname === 'localhost' || url.hostname === '127.0.0.1' || url.hostname === '[::1]';
    const allowedProtocol = url.protocol === 'https:' || (
      allowInsecureLoopback && loopback && url.protocol === 'http:'
    );
    if (!allowedProtocol || url.origin !== value) throw new Error('invalid origins');
    origins.add(value);
  }
  return origins;
}

function disabledDependencies(): SolutionApiDependencies {
  const unavailable = async (): Promise<never> => {
    throw new Error('service disabled');
  };
  return {
    enabled: false,
    allowedOrigins: new Set(),
    sessionSecret: new Uint8Array(32),
    sessionTtlSeconds: 86_400,
    now: () => new Date(),
    clientAddress: '',
    rateLimiter: { consume: unavailable },
    idempotency: { begin: unavailable, complete: unavailable },
    goclaw: { reply: unavailable },
  };
}

export function createRuntimeDependencies(
  env: Environment,
  clientAddress: string | undefined,
): SolutionApiDependencies {
  // Exact opt-in prevents values such as "TRUE", "1", or whitespace from
  // accidentally enabling an externally reachable paid AI endpoint.
  if (env.SOLUTION_CHAT_ENABLED !== 'true') return disabledDependencies();
  const localDev = env.SOLUTION_CHAT_LOCAL_DEV === 'true';
  if (localDev && env.NODE_ENV === 'production') {
    throw new Error('local solution chat mode is forbidden in production');
  }
  if (!clientAddress || clientAddress.length > 128 || /[\r\n]/.test(clientAddress)) {
    throw new Error('client address unavailable');
  }
  const secretHex = required(env, 'SOLUTION_SESSION_SECRET_HEX');
  if (!/^[0-9a-f]{64}$/.test(secretHex)) throw new Error('invalid session secret');
  const sessionSecret = Buffer.from(secretHex, 'hex');
  const stores = localDev
    ? createLocalStores()
    : createUpstashStores({
        url: required(env, 'UPSTASH_REDIS_REST_URL'),
        token: required(env, 'UPSTASH_REDIS_REST_TOKEN'),
        namespace: env.SOLUTION_REDIS_NAMESPACE || 'htlabs-solution-v1',
      });
  return {
    enabled: true,
    allowedOrigins: parseOrigins(required(env, 'SOLUTION_ALLOWED_ORIGINS'), localDev),
    sessionSecret,
    sessionTtlSeconds: parseInteger(
      env,
      'SOLUTION_SESSION_TTL_SECONDS',
      86_400,
      300,
      604_800,
    ),
    secureCookies: !localDev,
    now: () => new Date(),
    clientAddress,
    rateLimiter: stores.rateLimiter,
    idempotency: stores.idempotency,
    goclaw: createGoClawWebhookClient({
      baseUrl: required(env, 'GOCLAW_BASE_URL'),
      webhookId: required(env, 'GOCLAW_WEBHOOK_ID'),
      signingKey: required(env, 'GOCLAW_WEBHOOK_HMAC_KEY'),
      contract: required(env, 'GOCLAW_API_CONTRACT'),
      timeoutMs: parseInteger(env, 'GOCLAW_TIMEOUT_MS', 25_000, 1_000, 30_000),
      allowInsecureLoopback: localDev,
    }),
  };
}
