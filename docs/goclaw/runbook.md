# GoClaw HTLabs runbook

## Preconditions

Do not continue unless all are true:

1. HTLabs has written commercial-use permission for the pinned GoClaw release.
2. Security has approved the single-node or distributed replay-control design.
3. Privacy has approved retention and deletion behavior based on test evidence.
4. A provider and model are approved for customer input and regional data flow.
5. GoClaw, PostgreSQL and the HTLabs proxy are isolated in staging.

## Verify source and artifacts

Download the exact `v3.14.0` source archive and compare SHA-256 with
`integrations/goclaw/upstream.lock.json`. Do not use `latest`, `dev`, `main` or
an unpinned container tag.

With a checked-out source tree at the pinned commit:

```bash
GOCLAW_SOURCE_DIR=/path/to/goclaw \
  ./integrations/goclaw/scripts/verify-offline.sh
```

This check also proves the tool-profile, webhook continuity and REST deletion
assumptions used by this integration.

## Package and import in isolated localhost staging

Copy `integrations/goclaw/.env.example` outside the repository and populate it
through the approved secret store. Never commit the populated file.

First inspect the dry run:

```bash
./integrations/goclaw/scripts/bootstrap-local.sh
```

After the license gate is evidenced and the isolated gateway is ready, source
the secret environment and run with `--apply`. The bootstrap imports a
predefined agent, uploads and pins the skill, and creates an HMAC-only,
localhost-only webhook. It does not send a chat request.

The GoClaw import path activates a new agent even if the archive says
`inactive`; the bootstrap immediately sends an explicit update restoring
`status=inactive` before creating the webhook. Inspect the imported context,
effective zero-tool policy and pinned skill grant before an operator explicitly
activates the agent for the staging probe. Confirm the imported
`CAPABILITIES.md` contains all five approved reference headings and contains no
material outside the byte-locked skill bundle.

Immediately move the bootstrap secrets file into the secret manager, then
securely remove the local copy. GoClaw returns webhook secret material only on
create/rotate. Rotation has no grace window, so use a coordinated maintenance
procedure.

`GOCLAW_BOOTSTRAP_SECRETS_FILE` is mandatory, must be an absolute path outside
the repository and must not already exist. The script refuses to overwrite it.
It stores the returned `hmac_signing_key` as the raw 42-character GoClaw secret
with mode `0600`; move it without re-encoding. The proxy uses its UTF-8 bytes
directly as the HMAC key and never logs it. Do not hash or decode the value.

## Staging contract verification

Use only synthetic, non-personal test prompts. Explicitly enable the separately
gated probe:

```bash
GOCLAW_INTEGRATION_ENABLED=true \
GOCLAW_LICENSE_APPROVED=true \
GOCLAW_ALLOW_LLM_CONTRACT_PROBE=true \
GOCLAW_WEBHOOK_ID=from-secret-store \
GOCLAW_WEBHOOK_HMAC_KEY=from-secret-store \
  ./integrations/goclaw/scripts/probe-webhook-contract.sh
```

Then manually verify two calls with the same opaque `session_key` retain only
that session's context, while different session keys remain isolated. Confirm
the request omits `user_id` and the agent never starts GoClaw's name/timezone
bootstrap flow.
Verify Vietnamese and English outputs, the 300-character ceiling, one-question
limit, refusal to fabricate, prompt-injection resistance and the Calendly
consent gate.

## Required retention/deletion drill

Before production, create one synthetic session and inventory every persisted
record it produces. Exercise `sessions.delete` through an authenticated operator
WebSocket connection and verify the session row/history is gone. Separately
verify whether traces, webhook audit rows, episodic summaries or other derived
records remain. Implement approved cleanup for every required store and repeat
the drill. Until it passes, do not expose a “delete conversation” claim.
The current page only offers “Bắt đầu cuộc trò chuyện mới,” which resets the
local display and starts a new opaque GoClaw session. It does not claim or call
durable deletion.

## Required filesystem isolation drill

The current agent must expose zero tools. Verify the system-prompt preview and a
tool-policy trace show neither `read_file` nor any alias such as `Read`. Keep the
agent workspace empty and secret-free anyway. Confirm the GoClaw data directory,
tenant directories, CLI workspaces, provider credentials and proxy secrets are
not mounted into that workspace. A prompt-injection test asking for absolute
paths and another tenant's files must produce no tool call or content. Any future
need for dynamic skill reference reads requires a new threat model and evidence
that allowed prefixes are tenant-scoped; prompt rules alone are insufficient.

## Production topology

Terminate TLS at an approved internal ingress. Only the HTLabs proxy may reach
the GoClaw webhook. Browser requests terminate at the HTLabs application and
must never contain the webhook ID, HMAC key, gateway token or internal URL.

If proxy and GoClaw are not on the same host, do not simply disable
`localhost_only`. First add authenticated private networking and enforce source
policy at the ingress; GoClaw evaluates `RemoteAddr` and does not trust
`X-Forwarded-For` for its webhook allowlist.

The helper scripts allow HTTP only for loopback. Any remote base URL must be an
HTTPS origin with no userinfo, path, query or fragment, and additionally needs
the explicit remote gate.

Use a single GoClaw process until replay protection is moved to shared storage
or enforced upstream. Set per-webhook and application rate limits. Log opaque
request IDs and status codes only; do not log prompts, outputs or stable visitor
identifiers.

## Rollout and rollback

Keep the landing integration flag off during deployment. Enable only in staging,
then for internal traffic, then a small production cohort after all gates pass.

Rollback is immediate: disable the HTLabs integration flag, revoke the GoClaw
webhook, and preserve evidence needed for incident review under the approved
retention policy. Do not delete production data ad hoc.

## Upgrade procedure

For every GoClaw upgrade, pin a new stable tag, commit, tree and source archive
checksum. Re-read the license, webhook auth implementation, session-key logic,
session deletion paths, tool profiles and skill loader. Run offline verification,
contract fixtures, isolation tests and the deletion drill before rollout.
