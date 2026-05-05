# Design: HT Labs Landing Page — Content Swap (Keep Style)

**Date:** 2026-05-04 22:46 (Asia/Bangkok)
**Branch:** astro
**Status:** Approved

## Problem
Current site has FlowForge-style content (Automate Everything, Three.js hero, logistics case study, integrations). Need to replace with HT Labs company content (Comprehensive AI, services, team, partners, portfolio, FAQ) while keeping the exact same visual style.

## Decisions

| Area | Decision |
|---|---|
| Style | Keep all current tokens: dark zinc-950, orange #f97316, Inter + JetBrains Mono, .tech-glass, .grid-overlay, .bg-mesh, card patterns |
| Hero | Simplify to static — no Three.js, no sliders, just grid overlay + radial glows + text |
| Data | Astro Content Collections (MDX) for type-safe authoring |
| Approach | Hybrid swap — keep Layout, CSS, PreFooter, Footer; rebuild Hero; delete WhatWeAutomate, CaseStudy, Integrations, HeroInteractive; add Services, Team, Partners, Portfolio, FAQ |

## Section Order

```
Hero (static) → Services → Team → Partners → Portfolio → FAQ → PreFooter → Footer
```

## Content Collections

```
src/content/config.ts        — Zod schemas: team, service, partner, portfolio
src/content/team/*.md        — 4 real + 2 "Coming soon"
src/content/services/*.mdx   — 4 capability cards
src/content/partners/*.md    — placeholders
src/content/portfolio/gym.mdx — featured project
```

## Files to Delete
- `src/components/react/HeroInteractive.jsx`
- `src/components/WhatWeAutomate.astro`
- `src/components/CaseStudy.astro`
- `src/components/Integrations.astro`

## Files to Modify
- `src/components/Hero.astro` — rebuild as static (no Three.js)
- `src/pages/index.astro` — compose new section order
- `src/components/PreFooter.astro` — tweak CTA copy

## Files to Create
- `src/content/config.ts`
- `src/content/team/*.md` (6 files)
- `src/content/services/*.mdx` (4 files)
- `src/content/partners/*.md` (4-6 files)
- `src/content/portfolio/gym.mdx`
- `src/components/Services.astro`
- `src/components/Team.astro`
- `src/components/Partners.astro`
- `src/components/Portfolio.astro`
- `src/components/Faq.astro`

## Section Specs

### Hero (static)
- Header: `<img src="/logo.png">` + nav + "Contact" CTA
- Eyebrow: `● HT LABS / COMPREHENSIVE AI`
- Headline: `Comprehensive AI.` *End-to-end.*
- Subhead: end-to-end AI solutions copy
- CTA: "Contact Us" → mailto + "Accepting projects" pill
- Background: `.grid-overlay` + orange+blue radial glow

### Services (4 cards)
- Intro text: HT Labs delivers end-to-end AI solutions
- 4 cards: AI Agents & Automation (featured, accent border), AI Infrastructure, System Integration, AI Strategy & Advisory
- Card pattern: `rounded-2xl bg-white/[0.02] border border-white/5`

### Team (6 cards, 3×2)
- Vi Van Bảo (Biz Dev), Phung Tien Dũng (Tech Lead), Dang Quang Thanh (Software Architect), Nguyen Hong Son (AI Engineer), 2× Coming Soon
- Monogram avatars, mono role, social placeholders

### Partners (grayscale glass strip)
- 4-6 "Coming soon" placeholder cards, opacity 60→100 on hover

### Portfolio (featured + placeholders)
- Gym project: large card with cover, tags, summary
- 2 "Coming soon" cards

### FAQ (glass accordion)
- 6 Q&A in `<details>` + `.tech-glass` cards

## Next Steps
1. `/ck:plan` — create phased implementation plan
2. Phase order: setup Content Collections → rebuild Hero → Services → Team → Partners → Portfolio → FAQ → update index → PreFooter tweak → build verify
