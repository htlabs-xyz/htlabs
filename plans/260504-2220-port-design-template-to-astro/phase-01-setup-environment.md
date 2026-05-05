---
phase: 1
title: "Setup environment"
status: completed
priority: P1
effort: "30m"
dependencies: []
progress: "Completed — environment setup with Tailwind, React, Three.js, iconify-icon, fonts, and logo."
---

# Phase 01: Setup environment

## Overview
Install Astro integrations (Tailwind, React), runtime deps (three, iconify-icon), wire global CSS + fonts, move logo asset to `public/`.

## Requirements
- Functional: `yarn dev` boots Astro with Tailwind classes working and React island support.
- Non-functional: zero config drift from design-template's Tailwind setup (same fonts, same `accent` color).

## Architecture
Astro integrations layered via `astro.config.mjs`. Tailwind processes `src/**/*.{astro,jsx,js,ts}`. Global CSS imported once in `Layout.astro`. iconify-icon registered as web component via `<script>` tag — no React wrapper.

## Related Code Files
- Create:
  - `src/styles/global.css` (copy from `design-template/index.css`)
  - `public/logo.png` (move from repo root)
- Modify:
  - `astro.config.mjs` (add tailwind + react integrations)
  - `package.json` (deps added by `astro add`)
  - `tailwind.config.mjs` (created by `astro add`; merge `extends` from `design-template/tailwind.config.js`)
- Delete:
  - `logo.png` at repo root (after moving to `public/`)

## Implementation Steps
1. `npx astro add tailwind` — accept all prompts.
2. `npx astro add react` — accept all prompts.
3. `yarn add three iconify-icon`.
4. Edit `tailwind.config.mjs` `theme.extend`:
   ```js
   fontFamily: {
     sans: ['Inter', 'sans-serif'],
     mono: ['JetBrains Mono', 'monospace'],
   },
   colors: { accent: '#f97316' }
   ```
5. Copy `design-template/index.css` → `src/styles/global.css` (verbatim).
6. `mv logo.png public/logo.png`.
7. Verify `yarn dev` boots without error; visit `/` (default Astro page).

## Success Criteria
- [ ] `astro.config.mjs` lists `tailwind()` + `react()` integrations.
- [ ] `yarn dev` runs; Tailwind utility class on a test element renders.
- [ ] `public/logo.png` accessible at `/logo.png`.
- [ ] `src/styles/global.css` exists with all `design-template/index.css` content.

## Risk Assessment
- **Risk:** Astro 6 Tailwind integration may use Vite plugin form (different API than v4 docs). **Mitigation:** follow `astro add` interactive prompts; verify generated config.
- **Risk:** `iconify-icon` script needs to load before first usage. **Mitigation:** addressed in Phase 04 (Layout).
