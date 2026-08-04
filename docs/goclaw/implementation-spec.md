# HTLabs GoClaw solution finder specification

Status: implemented behind default-off production gates

## Objective and acceptance criteria

Activate the existing landing-page solution search only when explicitly
enabled. A valid prompt transfers once through five-minute `sessionStorage` to
`/giai-phap` without appearing in the URL. The new page supports anonymous,
multi-turn consultation through a same-origin server proxy to the pinned
GoClaw HTLabs agent.

Acceptance requires: no floating widget or login; no browser-visible GoClaw
secret; prompt at most 2,000 Unicode characters; assistant output at most 300
characters and one question; server-owned conversation identity; distributed
rate limiting and idempotency; safe retry; truthful deletion behavior; and
both presentation/runtime flags defaulting to false.

## Stack and structure

- Astro 6 static site with an on-demand Vercel API route.
- `src/components/FigmaLanding.astro`: existing search entry point.
- `src/pages/giai-phap.astro`: full-page anonymous consultation UI.
- `src/lib/solution/`: browser contract and tests.
- `src/pages/api/solution-chat.ts` and `src/lib/solution-api/`: boundary,
  anonymous capability, Upstash controls and GoClaw HMAC adapter.
- `integrations/goclaw/`: pinned upstream contract, byte-locked HTLabs skill,
  agent package, fixtures and gated operator scripts.
- `docs/goclaw/`: contract, production runbook and this specification.

Keep boundaries explicit, validate untrusted values at entry points, return
generic error codes, render model output only as text, and do not log prompts,
outputs, identifiers or secrets.

## Commands and testing strategy

Run from the repository root with the pinned Yarn runtime:

```bash
yarn install --immutable
yarn test
yarn astro check
yarn build
yarn npm audit --all --recursive --severity high
./integrations/goclaw/scripts/verify-offline.sh
```

Unit tests cover browser transfer/validation, anonymous capabilities, strict
HTTP input, kill switches, rate-store failure, idempotency states and retry,
HMAC exact bytes, GoClaw output bounds and runtime configuration. Build output
must contain the on-demand `/api/solution-chat` function. Live model calls and
the deletion drill run only in isolated staging after every gate below passes.

## Boundaries

Always keep both flags fail-closed, use exact pinned versions, treat model
output as untrusted text, use synthetic staging prompts and preserve an
immediate flag-based rollback.

Require explicit operator approval before importing/activating the agent,
calling a provider, changing retention/deletion, relaxing origin/network
policy, or rolling out beyond staging.

Never commit secrets, send prompt content in URLs/logs, accept browser-selected
GoClaw session keys, request PII in this release, expose filesystem/tools to the
agent, claim deletion that was not verified, or enable commercial production
without written GoClaw permission.

## Unresolved production gates

Production enablement remains blocked until HTLabs has written commercial-use
permission for GoClaw; provider/data-region approval; a tested retention and
operator deletion mechanism covering derived records; filesystem-isolation and
prompt-injection evidence; monitoring/alerts; and staged rollout approval. See
`contract.md` and `runbook.md` for exact evidence and rollback steps.
