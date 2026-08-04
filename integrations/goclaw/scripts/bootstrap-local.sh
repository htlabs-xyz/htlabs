#!/usr/bin/env bash
set -euo pipefail

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
root_dir="$(cd "$script_dir/.." && pwd)"

if [[ "${1:-}" != "--apply" ]]; then
  cat <<'EOF'
Dry run only. This bootstrap performs no request by default.

To import the pinned HTLabs agent and skill into an isolated localhost GoClaw:
  1. Obtain written commercial-use approval for GoClaw.
  2. Configure GOCLAW_PROVIDER, GOCLAW_MODEL, GOCLAW_ADMIN_TOKEN and
     GOCLAW_OWNER_USER_ID. Set GOCLAW_BOOTSTRAP_SECRETS_FILE to a new absolute
     path outside the repository.
  3. Set GOCLAW_LICENSE_APPROVED=true and GOCLAW_INTEGRATION_ENABLED=true.
  4. Run this script with --apply.

The created LLM webhook is HMAC-only and localhost-only. This script does not
invoke the agent or an LLM provider.
EOF
  exit 0
fi

[[ "${GOCLAW_INTEGRATION_ENABLED:-false}" == "true" ]] || { echo "GOCLAW_INTEGRATION_ENABLED must be true" >&2; exit 1; }
[[ "${GOCLAW_LICENSE_APPROVED:-false}" == "true" ]] || { echo "GOCLAW_LICENSE_APPROVED must be true" >&2; exit 1; }
: "${GOCLAW_ADMIN_TOKEN:?GOCLAW_ADMIN_TOKEN is required}"
: "${GOCLAW_OWNER_USER_ID:?GOCLAW_OWNER_USER_ID is required}"
: "${GOCLAW_PROVIDER:?GOCLAW_PROVIDER is required}"
: "${GOCLAW_MODEL:?GOCLAW_MODEL is required}"
: "${GOCLAW_BOOTSTRAP_SECRETS_FILE:?GOCLAW_BOOTSTRAP_SECRETS_FILE must be an absolute path outside the repository}"
[[ "$GOCLAW_ADMIN_TOKEN" =~ ^goclaw_[0-9a-f]{32}$ ]] || { echo "GOCLAW_ADMIN_TOKEN must be a scoped GoClaw API key" >&2; exit 1; }
[[ "$GOCLAW_OWNER_USER_ID" =~ ^[A-Za-z0-9._:-]{1,128}$ ]] || { echo "invalid GOCLAW_OWNER_USER_ID" >&2; exit 1; }
[[ "$GOCLAW_BOOTSTRAP_SECRETS_FILE" == /* ]] || { echo "GOCLAW_BOOTSTRAP_SECRETS_FILE must be absolute" >&2; exit 1; }
case "$GOCLAW_BOOTSTRAP_SECRETS_FILE" in
  "$root_dir"|"$root_dir"/*) echo "secrets file must be outside the repository" >&2; exit 1 ;;
esac
[[ ! -e "$GOCLAW_BOOTSTRAP_SECRETS_FILE" ]] || { echo "refusing to overwrite existing secrets file" >&2; exit 1; }
[[ -d "$(dirname "$GOCLAW_BOOTSTRAP_SECRETS_FILE")" ]] || { echo "secrets file parent directory does not exist" >&2; exit 1; }

base_url="$(node "$script_dir/validate-base-url.mjs" \
  "${GOCLAW_BASE_URL:-http://127.0.0.1:18790}" \
  "${GOCLAW_ALLOW_REMOTE_ADMIN:-false}")"

work_dir="$(mktemp -d /tmp/htlabs-goclaw-bootstrap.XXXXXX)"
trap 'rm -rf "$work_dir"' EXIT
"$script_dir/verify-offline.sh"
"$script_dir/package-agent.sh" "$work_dir/dist"

curl_config="$work_dir/curl.conf"
umask 077
printf 'header = "Authorization: Bearer %s"\nheader = "X-GoClaw-User-Id: %s"\n' \
  "$GOCLAW_ADMIN_TOKEN" "$GOCLAW_OWNER_USER_ID" > "$curl_config"

health_code="$(curl --silent --show-error --output /dev/null --write-out '%{http_code}' "$base_url/health")"
[[ "$health_code" == "200" ]] || { echo "GoClaw health check failed: HTTP $health_code" >&2; exit 1; }

import_response="$work_dir/import.json"
curl --fail --silent --show-error \
  --config "$curl_config" \
  --request POST "$base_url/v1/agents/import?include=config,context_files" \
  --form "file=@$work_dir/dist/htlabs-consultant.agent.tar.gz;type=application/gzip" \
  > "$import_response"
agent_id="$(jq -er .agent_id "$import_response")"

# GoClaw import activates new agents regardless of the archive status. Restore
# the intended inactive bootstrap state before any webhook exists.
curl --fail --silent --show-error \
  --config "$curl_config" \
  --request PUT "$base_url/v1/agents/$agent_id" \
  --header 'Content-Type: application/json' \
  --data '{"status":"inactive"}' \
  > /dev/null

upload_response="$work_dir/upload.json"
curl --fail --silent --show-error \
  --config "$curl_config" \
  --request POST "$base_url/v1/skills/upload" \
  --form "file=@$work_dir/dist/htlabs-customer-consultant.skill.zip;type=application/zip" \
  > "$upload_response"
skill_slug="$(jq -er .slug "$upload_response")"
skill_version="$(jq -er .version "$upload_response")"

skills_response="$work_dir/skills.json"
curl --fail --silent --show-error \
  --config "$curl_config" \
  "$base_url/v1/skills" > "$skills_response"
skill_id="$(jq -er --arg slug "$skill_slug" '.skills[] | select(.slug == $slug) | .id' "$skills_response" | head -n 1)"

curl --fail --silent --show-error \
  --config "$curl_config" \
  --request POST "$base_url/v1/skills/$skill_id/grants/agent" \
  --header 'Content-Type: application/json' \
  --data "$(jq -nc --arg agent_id "$agent_id" --argjson version "$skill_version" '{agent_id:$agent_id,pinned_version:$version,can_manage:false}')" \
  > /dev/null

webhook_response="$work_dir/webhook.json"
curl --fail --silent --show-error \
  --config "$curl_config" \
  --request POST "$base_url/v1/webhooks" \
  --header 'Content-Type: application/json' \
  --data "$(jq -nc --arg agent_id "$agent_id" '{name:"htlabs-solution-search",kind:"llm",agent_id:$agent_id,require_hmac:true,localhost_only:true,rate_limit_per_min:30,scopes:[],ip_allowlist:[]}')" \
  > "$webhook_response"

secrets_file="$GOCLAW_BOOTSTRAP_SECRETS_FILE"
jq '{id, secret_prefix, hmac_signing_key, localhost_only, require_hmac}' "$webhook_response" > "$secrets_file"
chmod 600 "$secrets_file"

echo "Imported inactive agent $agent_id and pinned skill $skill_slug@$skill_version."
echo "Created an HMAC-only, localhost-only webhook. Secrets saved to $secrets_file (mode 0600)."
echo "No LLM/provider request was made. Keep the landing integration disabled until contract and retention gates pass."
