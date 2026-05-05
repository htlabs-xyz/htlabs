# Content Swap Report: HT Labs Landing Page

**Date:** 2026-05-04 23:04 (Asia/Bangkok)
**Branch:** astro

## Summary
Replaced FlowForge-style content with HT Labs company content while preserving the exact visual style (dark zinc-950, orange accent, glass cards, grid overlay, Inter + JetBrains Mono).

## Before → After
| Before (FlowForge) | After (HT Labs) |
|---|---|
| Hero: "Automate Everything" + Three.js | Hero: "Comprehensive AI. End-to-end." (static) |
| What We Automate (3 cards) | Services (4 cards, 1 featured) |
| Case Study (gym logistics) | Team (6 cards, 3x2 grid) |
| Integrations (8 services) | Partners (4 placeholders) |
| Workflow CTA | Portfolio (1 featured + 2 placeholders) |
| PreFooter (email input) | FAQ (6 Q&A accordions) |
| Footer | PreFooter (mailto CTA) → Footer |

## Dependencies Removed
- `react`, `react-dom`, `@astrojs/react` (no React islands needed)
- `three`, `@types/three` (Three.js removed from hero)
- Result: **zero JS shipped** — fully static HTML

## All Sections Working
- Build: `yarn build` exits 0
- Dev server: `yarn dev` runs on localhost:4322
- Content: Astro Content Collections with Zod schemas, glob loaders
