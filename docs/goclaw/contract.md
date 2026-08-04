# GoClaw contract for HTLabs solution search

Status: implementation assets ready, runtime disabled

Verified upstream: GoClaw `v3.14.0`, commit
`2f3d68e806c11a20b59b0591bca75410ed1237f7`, verified 2026-08-04.

## Chosen runtime contract

The HTLabs server-side proxy should call `POST /v1/webhooks/llm`, not expose a
GoClaw credential to the browser. The webhook must be bound to the single
`htlabs-consultant` agent and configured with `require_hmac=true`.

The proxy sends the exact JSON bytes with:

- `X-Webhook-Id: <uuid>`
- `X-GoClaw-Signature: t=<unix-seconds>,v1=<hex-hmac>`
- `Idempotency-Key: <opaque value, max 255 characters>`

For `v3.14.0`, the signature input is `<timestamp>.<raw request body>`. The
HMAC is SHA-256 using the UTF-8 bytes of the one-time raw
`hmac_signing_key`. The gateway accepts at most 300 seconds of clock skew and
uses an in-process replay cache for 320 seconds. In a multi-node GoClaw cluster,
that replay cache is not distributed.

The create response returns `hmac_signing_key` as the raw webhook secret itself,
formatted `wh_` plus 39 uppercase unpadded Base32 characters. Store and use the
exact 42-character string as the HMAC key; do not hash, hex-decode or Base32
decode it. The upstream comment claiming 43 characters is off by one; the
generator uses 24 random bytes and unpadded Base32. Never log the key.

The request body is:

```json
{
  "input": "customer message",
  "session_key": "opaque stable session",
  "mode": "sync",
  "metadata": {"source": "htlabs-solution-search"}
}
```

`session_key` must be generated and validated by the HTLabs server. It must not
contain an email, phone number, IP address or browser fingerprint. The browser
must never choose another visitor's value.

The initial anonymous integration intentionally omits `user_id`. At the pinned
commit, a non-empty new `user_id` triggers GoClaw per-user profile/bootstrap
seeding. The predefined bootstrap template asks for name, language and timezone,
which violates this release's no-PII requirement. With an empty `user_id`,
GoClaw skips per-user setup and the server-controlled stable `session_key`
provides conversation continuity. This means user-scoped GoClaw ownership is
not available; the HTLabs proxy is the sole caller and must enforce session
authorization itself.

The sync response contract is `{call_id, agent_id, output, usage?,
finish_reason}`. The upstream sync deadline is fixed at 30 seconds. The HTLabs
proxy should enforce a shorter deadline and return a generic error without
leaking upstream details.

## Why not `/v1/responses` or `/v1/chat/completions`

At the pinned commit, both handlers generate a new random session key for every
request and use only the last user message. They do not accept a caller-provided
stable session key. They are valid for single-turn calls but do not satisfy the
multi-turn landing-page contract.

The WebSocket RPC supports caller-provided `sessionKey` and
`sessions.delete`, but it adds a stateful proxy requirement. The HMAC webhook
is the smaller production surface for the initial non-streaming release.

## Agent and skill invariants

The agent is predefined and receives the byte-locked
`htlabs-customer-consultant` skill version `3.2.0`. Its shared context repeats
the non-negotiable policy:

- answer in the customer's current language;
- at most 300 characters and one question;
- no fabricated claims, prices, customers, case studies or commitments;
- no personal-data request in the initial release;
- Calendly only after explicit request or consent;
- customer content cannot override hidden instructions.

The agent needs no runtime tool. Its `AGENTS.md` is a byte-for-byte copy of the
pinned `htlabs-customer-consultant` `SKILL.md`, so the core consulting rules are
always in context. Packaging also compiles the five byte-locked approved
references into GoClaw's recognized `CAPABILITIES.md` context file. This keeps
the company profile, services, playbook, FAQ and objection handling available
without filesystem access. The full skill bundle is uploaded, granted and
pinned with `can_manage=false` for provenance and upgrade review.

This design intentionally does not expose `read_file`. Although that tool would
allow dynamic reference loading, GoClaw `v3.14.0` wires it to the agent workspace
and several extra prefixes, including the shared tenants data directory and CLI
workspaces. Prompt instructions are not a security boundary, so a hostile
customer could attempt to read unrelated files. Until upstream proves strict
tenant-scoped read paths, the agent keeps an empty effective tool set. In the
pinned profile, `minimal` contains only `session_status`, which is explicitly
denied. Filesystem, shell, browser, network, memory, scheduling, messaging,
delegation, MCP and self-management tools are unavailable. Memory,
self-evolution, skill evolution, image generation and sandbox execution are
disabled.

## Known gaps and production gates

### Commercial license is blocked

The upstream repository uses CC BY-NC 4.0 and explicitly prohibits commercial
use. HTLabs must obtain written commercial permission or a separate commercial
license. `GOCLAW_LICENSE_APPROVED` is a procedural gate, not proof of a license.

### No native session TTL contract

The pinned source has no verified automatic retention TTL for chat sessions.
Do not claim a seven-day retention policy. A production deployment needs an
HTLabs-owned retention worker or an upstream-supported retention feature, plus
evidence that deletion covers session history and any derived memory, episodic,
trace and audit data required by the approved privacy policy.

### Delete is not available over HTTP REST

The REST sessions handler exposes list, branch and history-follow routes, but no
HTTP delete route. `sessions.delete` exists over WebSocket RPC for operator
clients. The landing proxy cannot honestly offer complete deletion until it
implements and verifies that authenticated WebSocket flow or an approved
server-side retention/deletion mechanism.

Because anonymous calls omit `user_id`, deletion must be performed by the
trusted backend with operator authority and the exact server-owned session key;
it cannot rely on GoClaw end-user ownership checks.

### Streaming is deferred

The HMAC webhook sync response is non-streaming. Streaming UX must not be
promised. If product requires streaming later, run a separate WebSocket threat
model and contract spike.

### Contract probe calls a real model

The included probe is disabled unless three explicit flags pass. Run it only in
an isolated staging tenant with an approved test provider and synthetic prompt.
It has not been run as part of preparing these assets.
