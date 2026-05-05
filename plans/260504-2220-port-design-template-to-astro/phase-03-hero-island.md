---
phase: 3
title: "Hero island"
status: completed
priority: P1
effort: "1h"
dependencies: [1]
progress: "Completed — Hero island with WebGL + slider controls built as React island."
---

# Phase 03: Hero island (interactive React)

## Overview
Build the only React island: `HeroInteractive.jsx` — merges ThreeCanvas WebGL animation with the slider control panel. Wraps Astro shell `Hero.astro` containing static header (logo, nav) and headline.

## Requirements
- Functional: 5 sliders (distortion, detail, speed, opacity, color) drive Three.js shader uniforms in real-time. WebGL canvas + control panel rendered.
- Non-functional: only this one island ships JS for the page; ~200kb gz total (React + Three.js).

## Architecture
```
Hero.astro
├── <header> (static: logo + nav)
├── <div class="headline"> (static: H1, subtitle, CTA buttons)
└── <HeroInteractive client:load /> (React island)
    ├── <ThreeCanvas /> internal — WebGL renderer
    └── <ControlPanel /> internal — sliders + state
```

State (`useState`) lives in `HeroInteractive`. Refs pass uniforms to Three.js (matching original `ThreeCanvas.jsx` pattern via `uniformsRef`).

## Related Code Files
- Create:
  - `src/components/Hero.astro` (Astro shell)
  - `src/components/react/HeroInteractive.jsx` (combined island)
- Read for reference:
  - `design-template/components/Hero.jsx`
  - `design-template/components/ThreeCanvas.jsx`

## Implementation Steps
1. Create `HeroInteractive.jsx`:
   - Copy entire `ThreeCanvas.jsx` body into a single component.
   - Hoist 5 `useState` hooks from `Hero.jsx` lines 5–9 (distortion, detail, speed, opacity, color).
   - Move the control panel JSX (Hero.jsx lines 74–174 — the bottom-right floating panel) into this component.
   - Move `<div ref={mountRef} ... />` into the same component.
   - Mount canvas + panel side-by-side as in original layout.
2. Create `Hero.astro`:
   - Copy outer `<section>` from Hero.jsx with grid-overlay + glow divs.
   - Copy `<header>` block (FF logo + nav).
   - Copy headline block (H1 "Automate Everything", subtitle, CTA buttons + System Online badge).
   - Copy bottom-left "Protocol v4.0.1" tag.
   - Mount `<HeroInteractive client:load />` for canvas + control panel.
3. Apply `.jsx → .astro` transforms (className, style, no React).
4. Verify dev: WebGL renders, sliders update animation, no hydration warnings in console.

## Success Criteria
- [ ] Hero section renders with WebGL animation.
- [ ] All 5 sliders mutate animation parameters live.
- [ ] Color buttons change particle color.
- [ ] No hydration mismatch warnings in browser console.
- [ ] Visual diff vs `design-template`: parity.

## Risk Assessment
- **Risk:** Hydration mismatch from `useEffect` Three.js init. **Mitigation:** if mismatch occurs, switch to `client:only="react"` (acceptable trade-off — Hero is above-fold, full hydration cost there is fine).
- **Risk:** `iconify-icon` inside React JSX needs custom-element TypeScript declaration. **Mitigation:** project is JS not TS for this component; if Astro's TS-checking complains, add `// @ts-nocheck` or declare globally.
- **Risk:** Three.js bundle size (~150kb gz). **Mitigation:** acceptable per user choice "tối ưu JS bundle" → already isolated to this island only.
