#!/usr/bin/env bash
set -euo pipefail

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
root_dir="$(cd "$script_dir/.." && pwd)"

command -v jq >/dev/null
command -v shasum >/dev/null
command -v node >/dev/null

for json_file in \
  "$root_dir/upstream.lock.json" \
  "$root_dir/agent/agent.json.template" \
  "$root_dir/agent/skill.lock.json" \
  "$root_dir/fixtures/webhook-llm.request.json" \
  "$root_dir/fixtures/webhook-llm.response.schema.json"; do
  jq -e . "$json_file" >/dev/null
done

[[ "$(node "$script_dir/validate-base-url.mjs" 'http://127.0.0.1:18790' false)" == "http://127.0.0.1:18790" ]]
[[ "$(node "$script_dir/validate-base-url.mjs" 'https://goclaw.internal.example' true)" == "https://goclaw.internal.example" ]]
if node "$script_dir/validate-base-url.mjs" 'http://goclaw.internal.example' true >/dev/null 2>&1; then
  echo "remote plaintext URL was unexpectedly accepted" >&2
  exit 1
fi
if node "$script_dir/validate-base-url.mjs" 'https://user:secret@goclaw.internal.example/?x=1' true >/dev/null 2>&1; then
  echo "credential-bearing URL was unexpectedly accepted" >&2
  exit 1
fi

hmac_fixture="$(node -e '
  const crypto = require("crypto");
  const key = "wh_" + "A".repeat(39);
  const mac = crypto.createHmac("sha256", Buffer.from(key, "utf8"));
  mac.update(Buffer.from("1700000000.{\"input\":\"hello\"}", "utf8"));
  process.stdout.write(mac.digest("hex"));
')"
[[ "$hmac_fixture" == "ee303e6f2e7fcb74be38add2bba8c3cee9666d639861f34d44fc3f6cb14043c0" ]] || {
  echo "raw webhook-secret HMAC fixture mismatch" >&2
  exit 1
}

jq -e '
  .release == "v3.14.0" and
  .commit == "2f3d68e806c11a20b59b0591bca75410ed1237f7" and
  .license == "CC-BY-NC-4.0"
' "$root_dir/upstream.lock.json" >/dev/null

jq -e '
  .agent_type == "predefined" and
  .status == "inactive" and
  .max_tool_iterations == 1 and
  .tools_config.profile == "minimal" and
  .tools_config.deny == ["session_status"] and
  (.tools_config | has("alsoAllow") | not) and
  .memory_config.enabled == false and
  .self_evolve == false and
  .skill_evolve == false and
  .other_config.allow_image_generation == false
' "$root_dir/agent/agent.json.template" >/dev/null

while IFS=$'\t' read -r relative_path expected_hash; do
  actual_hash="$(shasum -a 256 "$root_dir/agent/skill/$relative_path" | awk '{print $1}')"
  if [[ "$actual_hash" != "$expected_hash" ]]; then
    echo "skill checksum mismatch: $relative_path" >&2
    exit 1
  fi
done < <(jq -r '.files | to_entries[] | [.key, .value] | @tsv' "$root_dir/agent/skill.lock.json")

grep -q '^version: 3.2.0$' "$root_dir/agent/skill/SKILL.md"
grep -q 'không vượt quá 300 ký tự' "$root_dir/agent/skill/SKILL.md"
grep -q 'Chỉ hỏi một câu' "$root_dir/agent/skill/SKILL.md"
grep -q 'Chỉ gửi link Calendly sau khi khách đồng ý' "$root_dir/agent/skill/SKILL.md"
[[ "$(shasum -a 256 "$root_dir/agent/context/AGENTS.md" | awk '{print $1}')" == \
   "$(jq -r '.files["SKILL.md"]' "$root_dir/agent/skill.lock.json")" ]] || {
  echo "runtime AGENTS.md is not the byte-locked HTLabs skill" >&2
  exit 1
}

for reference in company-profile.md services.md consultant-playbook.md faq.md objection-handling.md; do
  grep -q "$reference" "$root_dir/scripts/package-agent.sh" || {
    echo "approved reference missing from packaged CAPABILITIES.md: $reference" >&2
    exit 1
  }
done
grep -q 'context_files: {count: 6}' "$root_dir/scripts/package-agent.sh"

if grep -R -n -E '(goclaw_[0-9a-f]{32}|wh_[A-Z2-7]{20,}|BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY)' \
  "$root_dir" --exclude='verify-offline.sh'; then
  echo "possible secret material found" >&2
  exit 1
fi

if [[ -n "${GOCLAW_SOURCE_DIR:-}" ]]; then
  locked_commit="$(jq -r .commit "$root_dir/upstream.lock.json")"
  actual_commit="$(git -C "$GOCLAW_SOURCE_DIR" rev-parse HEAD)"
  [[ "$actual_commit" == "$locked_commit" ]] || {
    echo "GoClaw source does not match locked commit" >&2
    exit 1
  }
  git -C "$GOCLAW_SOURCE_DIR" grep -q 'mux.Handle("POST /v1/webhooks/llm"' "$actual_commit" -- internal/http/webhooks_llm.go
  git -C "$GOCLAW_SOURCE_DIR" grep -q 'If the caller provides a sessionKey, it is used verbatim for conversation continuity' "$actual_commit" -- internal/http/webhooks_llm.go
  git -C "$GOCLAW_SOURCE_DIR" grep -q '"hmac_signing_key": raw' "$actual_commit" -- internal/http/webhooks_admin.go
  git -C "$GOCLAW_SOURCE_DIR" grep -q 'secretKeyBytes := \[\]byte(rawSecret)' "$actual_commit" -- internal/http/webhooks_auth.go
  git -C "$GOCLAW_SOURCE_DIR" grep -q 'if userID == ""' "$actual_commit" -- internal/agent/loop_utils.go
  git -C "$GOCLAW_SOURCE_DIR" grep -q 'return &userSetup{workspace: l.workspace}' "$actual_commit" -- internal/agent/loop_utils.go
  git -C "$GOCLAW_SOURCE_DIR" grep -q '"minimal":   {"session_status"}' "$actual_commit" -- internal/tools/policy.go
  git -C "$GOCLAW_SOURCE_DIR" grep -q 'filepath.Join(dataDir, "tenants")' "$actual_commit" -- cmd/gateway_tools_wiring.go
  git -C "$GOCLAW_SOURCE_DIR" grep -q 'pa.AllowPaths(filepath.Join(dataDir, "cli-workspaces"))' "$actual_commit" -- cmd/gateway_tools_wiring.go
  git -C "$GOCLAW_SOURCE_DIR" grep -q 'mux.HandleFunc("GET /v1/sessions"' "$actual_commit" -- internal/http/sessions.go
  if git -C "$GOCLAW_SOURCE_DIR" grep -q 'DELETE /v1/sessions' "$actual_commit" -- internal/http; then
    echo "Unexpected HTTP session-delete contract; re-audit integration" >&2
    exit 1
  fi
fi

echo "GoClaw integration artifacts verified (offline)."
