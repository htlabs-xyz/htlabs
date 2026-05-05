# Brainstorm: Port design-template → Astro (htlabs rebrand, JS-bundle optimized)

**Date:** 2026-05-04 22:20 (Asia/Bangkok)
**Branch:** astro
**Status:** Approved (pending plan)

## Problem
- `design-template/` = standalone React 18 + Vite + Tailwind + Three.js landing ("FlowForge Systems"), 8 components.
- Project root = empty Astro 6.2.1 starter on branch `astro`.
- Goal: port design 1:1 visually into Astro, rebrand to **htlabs**, minimize client JS.

## Constraints
- Single landing page (no routing).
- SEO/SSG = reason for Astro → must keep static HTML output.
- Hero has 5 stateful sliders driving Three.js shader uniforms → interactivity required.
- All other 6 sections fully static (verified: CaseStudy uses Unsplash CDN img, no JS).

## Decision
**Port `.jsx → .astro` for static sections; isolate interactivity into 1 React island.**

### Component mapping
| Source (design-template/components) | Target | Type |
|---|---|---|
| Hero.jsx | `Hero.astro` (shell) + `HeroInteractive.jsx` (island) | Hybrid |
| ThreeCanvas.jsx | merged into `HeroInteractive.jsx` | Inside island |
| WhatWeAutomate.jsx | `WhatWeAutomate.astro` | Static |
| CaseStudy.jsx | `CaseStudy.astro` | Static |
| Integrations.jsx | `Integrations.astro` | Static |
| WorkflowCTA.jsx | `WorkflowCTA.astro` | Static |
| PreFooter.jsx | `PreFooter.astro` | Static |
| Footer.jsx | `Footer.astro` | Static |

### Why 1 island (not 2)
Sliders state (distortion/detail/speed/opacity/color) drives ThreeCanvas uniforms. Splitting → cross-island state sync (nanostores/events) → violates KISS. Merge keeps state local in `useState`.

### Hydration
- `HeroInteractive` → `client:load` (above-fold, sliders need immediate interactivity).
- Three.js inside uses `useEffect` → fine for SSR-safe wrapper, but renderer creation only client-side. If hydration mismatch → fallback `client:only="react"`.

### Rebrand to htlabs
- "FlowForge" / "FF" logo → "htlabs" / use `logo.png` at repo root.
- "FlowForge operational engine" copy in CaseStudy → htlabs equivalent (TBD by user/copy pass).
- Domain-flavored strings ("Protocol v4.0.1", "WSS_Link.01", "Initialize System") → keep or adapt; default = keep aesthetic, swap brand name only.

### Tech setup
1. `npx astro add tailwind` (Astro 6 → Vite plugin variant)
2. `npx astro add react`
3. `yarn add three iconify-icon`
4. Copy `tailwind.config.js` extends (Inter, JetBrains Mono, accent #f97316)
5. Copy `index.css` → `src/styles/global.css`, import in `Layout.astro`
6. Add Google Fonts (Inter + JetBrains Mono) in `<head>`
7. Add `iconify-icon` script in Layout (web component, no React dep needed)

### File structure
```
src/
├── layouts/Layout.astro
├── pages/index.astro
├── styles/global.css
├── components/
│   ├── Hero.astro
│   ├── WhatWeAutomate.astro
│   ├── CaseStudy.astro
│   ├── Integrations.astro
│   ├── WorkflowCTA.astro
│   ├── PreFooter.astro
│   ├── Footer.astro
│   └── react/
│       └── HeroInteractive.jsx   # ThreeCanvas + control panel + state
public/
└── logo.png  (move from repo root)
```

### Port mechanics (.jsx → .astro)
- `className` → `class`
- `style={{ a: 'b' }}` → `style="a: b"`
- Remove `import React`
- Replace `{variable}` with `{variable}` (Astro syntax compatible)
- Move `iconify-icon` JSX as-is (works as web component)

## Bundle estimate
- Static sections: 0 JS shipped.
- HeroInteractive island: React (~45kb gz) + Three.js (~150kb gz) + component code.
- Total ~200kb gz JS, only on landing page.

## Alternatives rejected
- **Keep all .jsx + `<App client:load />`:** Faster to port (~30min) but ships React for entire page → loses Astro's value prop. Rejected per user choice "tối ưu JS bundle".
- **Replace Astro with React+Vite:** Loses SSG/SEO. Rejected per user choice (SEO is reason for Astro).
- **Split Hero into 2 islands:** Cross-island state sync overhead. Rejected (KISS).

## Risks
- Hydration mismatch in Three.js init → mitigation: try `client:load` first, fallback `client:only`.
- Tailwind Astro 6 integration API differs from older docs → verify with `astro add` output.
- `iconify-icon` web component needs custom element registration before first render → ensure script loads in `<head>`.

## Success criteria
- `yarn build` → static HTML for landing.
- Visual diff vs `design-template/` dev server: pixel-equivalent (font, spacing, colors, animations).
- Sliders + WebGL animation work post-build.
- No React bundle on response unless scrolling Hero (or `client:load` accepted as above-fold trade-off).
- Brand strings replaced: FlowForge → htlabs.

## Resolved decisions
- **Copy:** Full rewrite for htlabs (CaseStudy stats, Integrations list, WorkflowCTA pitch, Hero headline/subhead). Need user input or copywriting pass during implementation.
- **Logo:** `logo.png` replaces "FF" badge in Hero header; also use in Footer + favicon.
- **CaseStudy image:** Keep Unsplash CDN URL.

## Open questions
- Final copy text for htlabs sections — defer to implementation phase (use copywriting skill or user-supplied copy).
