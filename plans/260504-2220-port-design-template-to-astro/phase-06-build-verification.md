---
phase: 6
title: "Build verification"
status: completed
priority: P1
effort: "30m"
dependencies: [5]
progress: "Completed — build verified, static output confirmed, visual parity checked."
---

# Phase 06: Build verification & visual diff

## Overview
Confirm production build, JS bundle isolation, and visual parity with `design-template`. Optional cleanup of source template.

## Requirements
- Functional: `yarn build` succeeds. `yarn preview` serves built site identically.
- Non-functional: zero JS shipped on initial HTML for static sections; only Hero island JS loaded on demand.

## Architecture
Astro static build → `dist/`. Inspect output to verify chunk strategy. Manual visual diff between two dev servers (template vs new project) at multiple viewports.

## Related Code Files
- Read:
  - `dist/index.html` (verify static markup)
  - `dist/_astro/*.js` (verify bundles)

## Implementation Steps
1. `yarn build` — must complete with 0 errors.
2. `yarn preview` — open http://localhost:4321/.
3. Inspect `dist/index.html`: confirm all sections present as static HTML (no React placeholder divs for static components).
4. Inspect Network tab: only Hero island JS chunk loads (React + Three.js). No JS for other sections.
5. Run `design-template` dev server in parallel: `cd design-template && yarn install && yarn dev`.
6. Visual diff at 3 viewports: 375px (mobile), 1024px (tablet), 1440px (desktop). Spot-check each section.
7. Functional check: sliders work, color buttons work, animation runs smoothly.
8. (Optional) Remove `design-template/` directory once parity confirmed and committed.

## Success Criteria
- [ ] `yarn build` exits 0.
- [ ] `dist/index.html` contains static markup for all 7 sections.
- [ ] Only 1 JS bundle group loads (Hero island).
- [ ] Visual parity at 3 viewports.
- [ ] Sliders + WebGL animation functional in production preview.
- [ ] No console errors in browser.

## Risk Assessment
- **Risk:** Tailwind purge misses classes used dynamically (e.g., color buttons). **Mitigation:** all classes are static strings in source — should be safe; if missing, add to `safelist`.
- **Risk:** Three.js shader compile fails silently in production. **Mitigation:** check console; verify canvas renders.
- **Risk:** Removing `design-template/` prematurely. **Mitigation:** keep until user confirms parity in PR review.

## Notes
- If parity fails, return to specific phase (02 for static, 03 for Hero) and patch.
- Document any deviations in `plans/reports/post-implementation-260504-port-design-template.md`.
