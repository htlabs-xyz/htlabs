---
title: "HT Labs Landing Page Content Redesign"
description: "Swap FlowForge content to HT Labs company landing page while maintaining current visual style"
status: pending
priority: P1
effort: 8h
branch: astro
tags: [landing-page, content-collections, astro]
created: 2026-05-04
---

# HT Labs Landing Page Content Redesign Plan

This plan outlines the phased implementation to transform the current FlowForge-inspired landing page into a comprehensive HT Labs company landing page while preserving the existing visual design system.

## Section Order
Hero (static) → Services → Team → Partners → Portfolio → FAQ → PreFooter → Footer

## Key Changes
- Replace all existing content sections with HT Labs-specific content
- Convert Hero to static (remove Three.js dependency)
- Implement Astro Content Collections for type-safe content management
- Maintain existing visual style tokens (dark zinc-950, orange accent, glass cards, grid overlay, Inter + JetBrains Mono)

## Phases

### Phase 1: Setup and Content Collections
- [ ] Create content collection schemas and data files
- [ ] Set up Zod validation for team, services, partners, portfolio, FAQ
- [ ] Verify content collections work with Astro build

### Phase 2: Static Hero Implementation  
- [ ] Remove Three.js dependency from Hero component
- [ ] Implement new static hero with HT Labs copy
- [ ] Update navigation and CTA elements

### Phase 3: New Content Sections
- [ ] Implement Services section (4 capability cards)
- [ ] Implement Team section (6 team cards with monogram avatars)
- [ ] Implement Partners section (grayscale glass logo strip)
- [ ] Implement Portfolio section (featured card + placeholders)
- [ ] Implement FAQ section (6 Q&A glass accordion)

### Phase 4: Page Composition and Integration
- [ ] Update index.astro with new section order
- [ ] Update PreFooter copy and CTA
- [ ] Remove obsolete components and imports
- [ ] Clean up unused dependencies

### Phase 5: Testing and Validation
- [ ] Verify mobile responsiveness at sm/md/lg breakpoints
- [ ] Test content collection data integrity
- [ ] Validate build passes `yarn build`
- [ ] Confirm visual consistency with existing style tokens

## Dependencies
- Design report: `/home/tid/project/htlabs/htlabs/plans/reports/design-260504-2246-content-swap-keep-style.md`
- Current branch: `astro`
- Target branch: `astro` (same branch for incremental changes)