---
title: Port design-template to Astro (htlabs rebrand)
slug: 260504-2220-port-design-template-to-astro
status: completed
created: 2026-05-04
completed: 2026-05-04
branch: astro
source: brainstorm
brainstorm: plans/reports/brainstorm-260504-2220-port-design-template-to-astro.md
---

# Port design-template → Astro (htlabs)

Port `design-template/` (React+Vite "FlowForge" landing) into the Astro 6 project root. Rebrand to **htlabs**, optimize JS bundle (static sections ship 0 JS; only Hero hydrates).

## Phases

| # | Phase | Status | Effort | Depends on |
|---|---|---|---|---|
| 01 | [Setup environment](phase-01-setup-environment.md) | completed | 30m | — |
| 02 | [Port static components](phase-02-port-static-components.md) | completed | 1h | 01 |
| 03 | [Hero island](phase-03-hero-island.md) | completed | 1h | 01 |
| 04 | [Layout & index page](phase-04-layout-and-index.md) | completed | 20m | 02, 03 |
| 05 | [Rebrand copy pass](phase-05-rebrand-copy.md) | completed | 30m | 04 |
| 06 | [Build verification](phase-06-build-verification.md) | completed | 30m | 05 |

## Key dependencies
- Astro 6.2.1 (already installed)
- `@astrojs/tailwind` (or Vite Tailwind plugin per Astro 6), `@astrojs/react`
- `three`, `iconify-icon`
- Google Fonts: Inter, JetBrains Mono

## Reference
- Brainstorm: `plans/reports/brainstorm-260504-2220-port-design-template-to-astro.md`
- Source: `design-template/` (React+Vite, do not modify; cleanup post-verification)
- Logo: `logo.png` (repo root → move to `public/logo.png`)

## Success criteria
- `yarn build` produces static HTML for `/`.
- Visual parity with `design-template` dev server.
- Static sections ship 0 JS; only Hero island hydrates.
- Brand strings = "htlabs"; copy rewritten for htlabs context.
