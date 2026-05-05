---
title: "Phase 1: Setup and Content Collections"
description: "Create Astro Content Collections schemas and data files for HT Labs content"
status: pending
priority: P1
effort: 2h
---

## Context Links
- Main plan: `/home/tid/project/htlabs/htlabs/plans/260504-2246-content-swap-keep-style/plan.md`
- Design report: `/home/tid/project/htlabs/htlabs/plans/reports/design-260504-2246-content-swap-keep-style.md`

## Overview
**Priority:** P1  
**Current status:** Not started  
**Brief description:** Set up Astro Content Collections with Zod schemas for all HT Labs content types (team, services, partners, portfolio, FAQ) and populate with initial data.

## Key Insights
- Astro Content Collections provide type-safe content management with automatic TypeScript generation
- Zod schemas ensure data validation at build time
- Content collections will replace hardcoded component data with dynamic, maintainable content

## Requirements
### Functional Requirements
- Create `src/content/config.ts` with Zod schemas for all content types
- Populate team members with accurate role descriptions
- Create service descriptions that highlight HT Labs capabilities
- Add placeholder content for partners and portfolio
- Implement FAQ questions and answers

### Non-functional Requirements
- All schemas must validate successfully with Astro build
- Content must be easily maintainable by non-developers
- Type safety must be preserved throughout the application

## Architecture
### Content Collection Structure
```
src/content/
├── config.ts
├── team/
│   ├── vi-van-bao.md
│   ├── phung-tien-dung.md
│   ├── dang-quang-thanh.md
│   ├── nguyen-hong-son.md
│   ├── coming-soon-data-mlops.md
│   └── coming-soon-devops.md
├── services/
│   ├── ai-agents-automation.mdx
│   ├── ai-infrastructure.mdx
│   ├── system-integration.mdx
│   └── ai-strategy-advisory.mdx
├── partners/
│   ├── partner-placeholder-1.md
│   ├── partner-placeholder-2.md
│   ├── partner-placeholder-3.md
│   └── partner-placeholder-4.md
├── portfolio/
│   ├── gym.mdx
│   ├── coming-soon-1.md
│   └── coming-soon-2.md
└── faq/
    ├── comprehensive-ai.md
    ├── build-vs-integrate.md
    ├── timeline.md
    ├── support.md
    ├── industries.md
    └── how-to-start.md
```

## Related Code Files
### Files to Create
- `src/content/config.ts`
- `src/content/team/vi-van-bao.md`
- `src/content/team/phung-tien-dung.md`
- `src/content/team/dang-quang-thanh.md`
- `src/content/team/nguyen-hong-son.md`
- `src/content/team/coming-soon-data-mlops.md`
- `src/content/team/coming-soon-devops.md`
- `src/content/services/ai-agents-automation.mdx`
- `src/content/services/ai-infrastructure.mdx`
- `src/content/services/system-integration.mdx`
- `src/content/services/ai-strategy-advisory.mdx`
- `src/content/partners/partner-placeholder-1.md`
- `src/content/partners/partner-placeholder-2.md`
- `src/content/partners/partner-placeholder-3.md`
- `src/content/partners/partner-placeholder-4.md`
- `src/content/portfolio/gym.mdx`
- `src/content/portfolio/coming-soon-1.md`
- `src/content/portfolio/coming-soon-2.md`
- `src/content/faq/comprehensive-ai.md`
- `src/content/faq/build-vs-integrate.md`
- `src/content/faq/timeline.md`
- `src/content/faq/support.md`
- `src/content/faq/industries.md`
- `src/content/faq/how-to-start.md`

## Implementation Steps
1. **Create content collection config**
   - Create `src/content/config.ts`
   - Define Zod schemas for team, services, partners, portfolio, and FAQ
   - Export collection definitions

2. **Populate team content**
   - Create 6 team member files with frontmatter (name, role, bio)
   - Use consistent formatting for all team members
   - Include placeholders for future hires

3. **Populate services content**
   - Create 4 service files as MDX for rich formatting
   - Include featured service highlighting AI Agents & Automation
   - Ensure descriptions align with HT Labs positioning

4. **Populate partners content**
   - Create 4 placeholder partner files
   - Use consistent "Coming soon" messaging

5. **Populate portfolio content**
   - Create featured gym project as MDX
   - Add 2 placeholder portfolio items
   - Include relevant tags and metadata

6. **Populate FAQ content**
   - Create 6 FAQ entries with question/answer structure
   - Ensure answers are concise and informative

7. **Verify content collections**
   - Run `yarn dev` to verify content collections generate correctly
   - Check TypeScript types are generated properly

## Todo List
- [ ] Create `src/content/config.ts` with Zod schemas
- [ ] Create all team member content files
- [ ] Create all service content files (MDX)
- [ ] Create all partner placeholder files
- [ ] Create portfolio content files (featured + placeholders)
- [ ] Create FAQ content files
- [ ] Verify content collections work with Astro dev server

## Success Criteria
- All content files are created with proper frontmatter
- Zod schemas validate all content successfully
- Astro dev server starts without content collection errors
- TypeScript types are generated correctly for all collections

## Risk Assessment
- **Risk:** MDX content may have syntax errors that break build
  - **Mitigation:** Test each MDX file individually before full integration
- **Risk:** Zod schema validation may be too strict/loose
  - **Mitigation:** Start with required fields only, add optional fields incrementally

## Security Considerations
- Content collections are static files, no security risks
- MDX content should avoid executable code (use standard Markdown)

## Next Steps
- Proceed to Phase 2: Static Hero Implementation
- Ensure content collections are ready for component consumption