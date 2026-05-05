---
phase: 5
title: "Rebrand copy pass"
status: completed
priority: P2
effort: "30m"
dependencies: [4]
progress: "Completed — FlowForge branding replaced with htlabs copy across all components."
---

# Phase 05: Rebrand to htlabs (full copy rewrite)

## Overview
Replace all "FlowForge" branding and marketing copy with htlabs equivalents. Full rewrite (not just brand swap) per user decision.

## Requirements
- Functional: no occurrences of "FlowForge" or "FF" remain in markup.
- Non-functional: copy reflects htlabs positioning. Length/tone matches design (concise, technical, confident).

## Architecture
Touch only text content + brand name occurrences. Do not change markup structure, classes, or layout.

## Related Code Files
- Modify:
  - `src/components/Hero.astro` (logo badge, headline, subhead, status tag, side panel labels)
  - `src/components/WhatWeAutomate.astro`
  - `src/components/CaseStudy.astro` (case study text, stats, brand)
  - `src/components/Integrations.astro` (partner list — adjust to htlabs ecosystem)
  - `src/components/WorkflowCTA.astro`
  - `src/components/PreFooter.astro`
  - `src/components/Footer.astro` (brand, links, copyright)
  - `src/layouts/Layout.astro` (title, description meta)

## Implementation Steps
1. Hero header: replace "FF" badge `<div>` with `<img src="/logo.png" alt="htlabs" class="w-7 h-7" />`. Replace "FlowForge" text with "htlabs".
2. Hero headline: keep "Automate / Everything." OR rewrite to htlabs tagline (TBD — propose 2 options to user during execution).
3. Hero subhead: rewrite for htlabs positioning (~2 sentences, ≤200 chars).
4. CaseStudy: rewrite "Global Logistics Inc" case + stats. If no real case yet → use "[Customer]" placeholders + plausible htlabs-flavored numbers, mark with `<!-- TODO: real customer case -->` comment.
5. Integrations: rewrite partner list — keep visual count, swap names to htlabs-relevant tools/platforms.
6. WorkflowCTA, PreFooter, Footer: replace brand mentions; rewrite calls-to-action.
7. Footer copyright: `© 2026 htlabs`.
8. Layout title: already set in Phase 04 — verify.
9. Final grep: `grep -ri "flowforge\|FF\b" src/` returns nothing (case-insensitive).

## Success Criteria
- [ ] `grep -ri "flowforge" src/` empty.
- [ ] Hero logo = `logo.png` image, not "FF" text badge.
- [ ] All sections show htlabs-branded copy.
- [ ] Visual layout unchanged (only text replaced).

## Risk Assessment
- **Risk:** Copy rewrite is subjective — user may iterate. **Mitigation:** during execution, present 2 options for headline/key sentences via AskUserQuestion before committing.
- **Risk:** Integrations partner list may misrepresent htlabs's actual integrations. **Mitigation:** flag with TODO comments; user supplies real list later.
- **Risk:** logo.png aspect ratio differs from "FF" 28x28 badge → layout shift. **Mitigation:** apply `object-contain` and matching size class; visual check.
