import type { APIRoute } from 'astro';

import { createRuntimeDependencies } from '../../lib/solution-api/runtime';
import { handleSolutionChat } from '../../lib/solution-api/solution-api';

export const prerender = false;

const unavailable = () =>
  new Response(JSON.stringify({ error: { code: 'SERVICE_UNAVAILABLE' } }), {
    status: 503,
    headers: {
      'cache-control': 'no-store',
      'content-type': 'application/json; charset=utf-8',
      'x-content-type-options': 'nosniff',
    },
  });

const route: APIRoute = async (context) => {
  let clientAddress: string | undefined;
  if (process.env.SOLUTION_CHAT_ENABLED === 'true') {
    try {
      // Astro obtains this from the deployment adapter. We intentionally never
      // trust a caller-controlled X-Forwarded-For value here.
      clientAddress = context.clientAddress;
    } catch {
      // The Astro dev server does not expose adapter clientAddress. This
      // fallback is reachable only through the explicit local-preview mode,
      // which runtime.ts rejects when NODE_ENV=production.
      if (process.env.SOLUTION_CHAT_LOCAL_DEV === 'true') {
        clientAddress = '127.0.0.1';
      } else {
        return unavailable();
      }
    }
  }
  try {
    const dependencies = createRuntimeDependencies(process.env, clientAddress);
    return await handleSolutionChat(context.request, dependencies);
  } catch (error) {
    if (process.env.SOLUTION_CHAT_LOCAL_DEV === 'true') {
      console.error(
        'solution chat local preview failed:',
        error instanceof Error ? error.message : 'unknown error',
      );
    }
    return unavailable();
  }
};

export const POST = route;
export const DELETE = route;
