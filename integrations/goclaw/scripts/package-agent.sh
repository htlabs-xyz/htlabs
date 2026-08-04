#!/usr/bin/env bash
set -euo pipefail

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
root_dir="$(cd "$script_dir/.." && pwd)"
provider="${GOCLAW_PROVIDER:-}"
model="${GOCLAW_MODEL:-}"
output_dir="${1:-$root_dir/dist}"

[[ -n "$provider" ]] || { echo "GOCLAW_PROVIDER is required" >&2; exit 1; }
[[ -n "$model" ]] || { echo "GOCLAW_MODEL is required" >&2; exit 1; }
command -v jq >/dev/null
command -v zip >/dev/null
command -v tar >/dev/null
command -v unzip >/dev/null

work_dir="$(mktemp -d /tmp/htlabs-goclaw-package.XXXXXX)"
trap 'rm -rf "$work_dir"' EXIT
mkdir -p "$work_dir/agent/context_files" "$output_dir"

jq --arg provider "$provider" --arg model "$model" '
  .provider = $provider |
  .model = $model
' "$root_dir/agent/agent.json.template" > "$work_dir/agent/agent.json"

cp "$root_dir"/agent/context/*.md "$work_dir/agent/context_files/"
capabilities_file="$work_dir/agent/context_files/CAPABILITIES.md"
printf '%s\n' '# HTLabs approved capabilities' > "$capabilities_file"
for reference in \
  company-profile.md \
  services.md \
  consultant-playbook.md \
  faq.md \
  objection-handling.md; do
  printf '\n\n' >> "$capabilities_file"
  sed '1s/^# /## /' "$root_dir/agent/skill/references/$reference" >> "$capabilities_file"
done
jq -n --arg exported_at "$(date -u +%Y-%m-%dT%H:%M:%SZ)" '
  {
    version: 1,
    format: "goclaw-agent-export",
    exported_at: $exported_at,
    exported_by: "htlabs-controlled-bootstrap",
    agent_key: "htlabs-consultant",
    agent_id: "",
    sections: {config: {count: 1}, context_files: {count: 6}}
  }
' > "$work_dir/agent/manifest.json"

COPYFILE_DISABLE=1 tar -C "$work_dir/agent" -czf "$output_dir/htlabs-consultant.agent.tar.gz" \
  agent.json manifest.json context_files
(
  cd "$root_dir/agent/skill"
  zip -q -r "$output_dir/htlabs-customer-consultant.skill.zip" SKILL.md references
)

shasum -a 256 \
  "$output_dir/htlabs-consultant.agent.tar.gz" \
  "$output_dir/htlabs-customer-consultant.skill.zip" \
  > "$output_dir/SHA256SUMS"

if tar -tzf "$output_dir/htlabs-consultant.agent.tar.gz" | grep -Eq '(^|/)\._'; then
  echo "agent archive contains macOS AppleDouble metadata" >&2
  exit 1
fi
if unzip -Z1 "$output_dir/htlabs-customer-consultant.skill.zip" | grep -Eq '(^|/)\._'; then
  echo "skill archive contains macOS AppleDouble metadata" >&2
  exit 1
fi
echo "Packaged GoClaw artifacts in $output_dir"
