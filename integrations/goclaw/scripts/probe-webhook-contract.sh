#!/usr/bin/env bash
set -euo pipefail

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
root_dir="$(cd "$script_dir/.." && pwd)"

[[ "${GOCLAW_INTEGRATION_ENABLED:-false}" == "true" ]] || { echo "GOCLAW_INTEGRATION_ENABLED must be true" >&2; exit 1; }
[[ "${GOCLAW_LICENSE_APPROVED:-false}" == "true" ]] || { echo "GOCLAW_LICENSE_APPROVED must be true" >&2; exit 1; }
[[ "${GOCLAW_ALLOW_LLM_CONTRACT_PROBE:-false}" == "true" ]] || { echo "GOCLAW_ALLOW_LLM_CONTRACT_PROBE must be true" >&2; exit 1; }
: "${GOCLAW_WEBHOOK_ID:?GOCLAW_WEBHOOK_ID is required}"
: "${GOCLAW_WEBHOOK_HMAC_KEY:?GOCLAW_WEBHOOK_HMAC_KEY is required}"
[[ "$GOCLAW_WEBHOOK_ID" =~ ^[0-9a-fA-F-]{36}$ ]] || { echo "invalid GOCLAW_WEBHOOK_ID" >&2; exit 1; }
[[ "$GOCLAW_WEBHOOK_HMAC_KEY" =~ ^wh_[A-Z2-7]{39}$ ]] || { echo "invalid GOCLAW_WEBHOOK_HMAC_KEY" >&2; exit 1; }

base_url="$(node "$script_dir/validate-base-url.mjs" \
  "${GOCLAW_BASE_URL:-http://127.0.0.1:18790}" \
  "${GOCLAW_ALLOW_REMOTE_ADMIN:-false}")"

request_file="$root_dir/fixtures/webhook-llm.request.json"
timestamp="$(date +%s)"
signature="$(
  GOCLAW_SIGNATURE_TIMESTAMP="$timestamp" GOCLAW_SIGNATURE_BODY_FILE="$request_file" \
    node -e '
      const fs = require("fs");
      const crypto = require("crypto");
      const ts = process.env.GOCLAW_SIGNATURE_TIMESTAMP;
      const body = fs.readFileSync(process.env.GOCLAW_SIGNATURE_BODY_FILE);
      const mac = crypto.createHmac("sha256", Buffer.from(process.env.GOCLAW_WEBHOOK_HMAC_KEY, "utf8"));
      mac.update(Buffer.from(`${ts}.`, "utf8"));
      mac.update(body);
      process.stdout.write(mac.digest("hex"));
    '
)"
response_file="$(mktemp /tmp/htlabs-goclaw-response.XXXXXX)"
trap 'rm -f "$response_file"' EXIT

http_code="$(curl --silent --show-error --output "$response_file" --write-out '%{http_code}' \
  --request POST "$base_url/v1/webhooks/llm" \
  --header 'Content-Type: application/json' \
  --header "X-Webhook-Id: $GOCLAW_WEBHOOK_ID" \
  --header "X-GoClaw-Signature: t=$timestamp,v1=$signature" \
  --header "Idempotency-Key: htlabs-contract-$timestamp" \
  --data-binary "@$request_file")"

[[ "$http_code" == "200" ]] || { echo "contract probe failed with HTTP $http_code" >&2; exit 1; }
jq -e '
  (.call_id | type == "string" and length > 0) and
  (.agent_id | type == "string" and length > 0) and
  (.output | type == "string" and length <= 300) and
  .finish_reason == "stop"
' "$response_file" >/dev/null
echo "GoClaw webhook LLM contract probe passed."
