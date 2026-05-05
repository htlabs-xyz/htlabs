# Implementation Report: Content Swap — HT Labs Landing Page

**Date:** 2026-05-04 23:03 (Asia/Bangkok)
**Branch:** astro
**Status:** completed

## What was done

### Phase 01: Content Collections
- `src/content.config.ts` — Zod schemas for team, services, partners, portfolio, FAQ with Astro 6 glob loaders
- 6 team members (4 real + 2 "Coming soon")
- 4 services (AI Agents & Automation featured)
- 4 partner placeholders
- 1 portfolio (gym) + 2 placeholders
- 6 FAQ entries with full Q&A

### Phase 02: Static Hero
- `src/components/Hero.astro` — rebuilt without Three.js
- Static hero with grid overlay, orange+blue radial glows, "Comprehensive AI. End-to-end." headline
- Nav: Services, Team, Portfolio + Contact CTA → mailto
- Removed `src/components/react/HeroInteractive.jsx`
- Removed `three`, `@astrojs/react`, `react`, `react-dom`, `@types/three` from package.json

### Phase 03: New Content Sections
- `src/components/Services.astro` — 4 cards from Content Collections, featured card with orange accent border
- `src/components/Team.astro` — 6 team cards (3x2 grid) with monogram avatars, "Coming soon" dimmed
- `src/components/Partners.astro` — 4 "Coming soon" glass cards
- `src/components/Portfolio.astro` — featured large card with tags + 2 placeholders
- `src/components/Faq.astro` — 6 Q&A in glass `<details>` accordions

### Phase 04: Integration
- `src/pages/index.astro` — new section order: Hero → Services → Team → Partners → Portfolio → FAQ → PreFooter → Footer
- `src/components/PreFooter.astro` — updated CTA copy to "Ready to operate AI?" → mailto
- `astro.config.mjs` — removed React integration
- `tsconfig.json` — removed jsx configuration
- Deleted: `WhatWeAutomate.astro`, `CaseStudy.astro`, `Integrations.astro`, `react/HeroInteractive.jsx`, `react/` dir

## Files changed
```
Created:
  src/content.config.ts
  src/content/team/*.md (6 files)
  src/content/services/*.md (4 files)
  src/content/partners/*.md (4 files)
  src/content/portfolio/*.md (3 files)
  src/content/faq/*.md (6 files)
  src/components/Services.astro
  src/components/Team.astro
  src/components/Partners.astro
  src/components/Portfolio.astro
  src/components/Faq.astro

Modified:
  src/components/Hero.astro (complete rewrite)
  src/components/PreFooter.astro (copy update)
  src/pages/index.astro (section order)
  package.json (removed React, Three.js deps)
  astro.config.mjs (removed React integration)
  tsconfig.json (removed jsx config)

Deleted:
  src/components/react/HeroInteractive.jsx
  src/components/WhatWeAutomate.astro
  src/components/CaseStudy.astro
  src/components/Integrations.astro
```

## Build verification
- `yarn build` exits 0
- Static output at `dist/index.html` — all 8 sections present
- Zero JS shipped (no React islands, no Three.js)
- All content rendered from Astro Content Collections
