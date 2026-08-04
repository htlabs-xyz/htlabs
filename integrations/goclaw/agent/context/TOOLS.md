# Tool policy

This agent requires no runtime tools. The byte-locked
`htlabs-customer-consultant` SKILL.md is already loaded verbatim as AGENTS.md.

Do not call filesystem read/write, shell, browser, network, memory, scheduling,
messaging, delegation, MCP, custom or self-management tools.

The pinned GoClaw `v3.14.0` policy uses profile `minimal`, whose only tool is
`session_status`; the agent configuration explicitly denies it, yielding an
empty effective tool set. Re-verify this invariant before every GoClaw upgrade.
