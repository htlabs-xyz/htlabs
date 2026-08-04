# HTLabs GoClaw integration assets

This directory contains an offline, default-off integration bundle for the
HTLabs solution-search experience. It does not vendor GoClaw and contains no
runtime secret.

The upstream pin is `v3.14.0` at commit
`2f3d68e806c11a20b59b0591bca75410ed1237f7`. The copied
`htlabs-customer-consultant` skill is byte-for-byte locked at version `3.2.0`.

Run the offline checks:

```bash
./integrations/goclaw/scripts/verify-offline.sh
```

Build importable artifacts without making a network request:

```bash
GOCLAW_PROVIDER=replace-me GOCLAW_MODEL=replace-me \
  ./integrations/goclaw/scripts/package-agent.sh /tmp/htlabs-goclaw-dist
```

`bootstrap-local.sh` is a dry run unless `--apply` and all explicit safety
gates are supplied. It creates a localhost-only, HMAC-only webhook and never
invokes the LLM. `probe-webhook-contract.sh` is separately gated because it
does invoke the configured provider.

Read `docs/goclaw/contract.md` and `docs/goclaw/runbook.md` before any apply or
production enablement.
