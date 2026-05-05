---
title: "Phase 3: New Content Sections"
description: "Implement Services, Team, Partners, Portfolio, and FAQ sections using content collections"
status: pending
priority: P1
effort: 2.5h
---

## Context Links
- Main plan: `/home/tid/project/htlabs/htlabs/plans/260504-2246-content-swap-keep-style/plan.md`
- Phase 1: `/home/tid/project/htlabs/htlabs/plans/260504-2246-content-swap-keep-style/phase-01-setup-content-collections.md`

## Overview
**Priority:** P1  
**Current status:** Not started  
**Brief description:** Create new Astro components for all HT Labs content sections (Services, Team, Partners, Portfolio, FAQ) that consume data from content collections and maintain the existing visual style.

## Key Insights
- All sections must use existing style tokens (dark zinc-950, orange accent, glass cards, grid overlay)
- Components should be responsive and work at sm/md/lg breakpoints
- Content collections provide type-safe data access
- Each section has specific layout requirements

## Requirements
### Functional Requirements
- **Services**: 4 capability cards grid with featured card highlighting AI Agents & Automation
- **Team**: 6 team cards (3x2 grid) with monogram avatars for each member
- **Partners**: Grayscale glass logo strip with 4-6 placeholder "Coming soon" cards
- **Portfolio**: Featured large card (gym project) + 2 placeholders
- **FAQ**: 6 Q&A glass accordion with smooth expand/collapse behavior

### Non-functional Requirements
- All components must be mobile responsive
- Maintain consistent spacing and typography with existing design
- Use same glass card styling as current components
- Ensure accessibility (proper ARIA labels, keyboard navigation)

## Architecture
### Component Structure
Each section component will:
- Import relevant content collections
- Use Astro's `getCollection` to fetch data
- Render content with consistent styling
- Handle responsive layouts appropriately

### Data Flow
```
Content Collections → Section Components → index.astro
```

### Visual Consistency
- All cards use `.tech-glass` class for glass effect
- Typography follows Inter (body) + JetBrains Mono (code/monospace)
- Color palette: zinc-950 background, orange-500 accent, white text
- Grid overlay maintained in section backgrounds where appropriate

## Related Code Files
### Files to Create
- `src/components/Services.astro`
- `src/components/Team.astro`
- `src/components/Partners.astro`
- `src/components/Portfolio.astro`
- `src/components/Faq.astro`

### Files to Read for Reference
- `src/components/WhatWeAutomate.astro` (card styling reference)
- `src/components/CaseStudy.astro` (layout patterns)
- `src/components/Integrations.astro` (grid layouts)

## Implementation Steps
1. **Services Component**
   - Create 4-card grid layout
   - Highlight AI Agents & Automation as featured card
   - Use MDX content for rich formatting
   - Implement consistent card styling with glass effect

2. **Team Component**
   - Create 3x2 grid for 6 team members
   - Generate monogram avatars from names (first letter of first + last name)
   - Display name, role, and bio consistently
   - Handle placeholder team members gracefully

3. **Partners Component**
   - Create horizontal scrolling or fixed grid of partner logos
   - Use grayscale treatment for placeholder partners
   - Apply glass card styling consistently
   - Ensure responsive behavior on mobile

4. **Portfolio Component**
   - Create featured large card for gym project
   - Add 2 smaller placeholder cards
   - Include project tags and summary
   - Use MDX for rich project descriptions

5. **FAQ Component**
   - Implement accordion pattern with smooth transitions
   - Use glass card styling for questions
   - Ensure proper ARIA attributes for accessibility
   - Handle mobile touch targets appropriately

6. **Styling Consistency**
   - Apply same spacing, typography, and color variables
   - Use existing Tailwind classes where possible
   - Maintain grid overlay backgrounds where appropriate

## Todo List
- [ ] Create Services.astro component with 4-card grid
- [ ] Create Team.astro component with 3x2 grid and monogram avatars
- [ ] Create Partners.astro component with grayscale logo strip
- [ ] Create Portfolio.astro component with featured + placeholder cards
- [ ] Create Faq.astro component with glass accordion
- [ ] Ensure all components are mobile responsive
- [ ] Verify visual consistency with existing design tokens

## Success Criteria
- All components render correctly with content collection data
- Visual styling matches existing design language exactly
- Mobile responsiveness works at sm/md/lg breakpoints
- Accessibility requirements are met
- Components integrate cleanly with index.astro

## Risk Assessment
- **Risk:** MDX content rendering issues in components
  - **Mitigation:** Test MDX rendering early with simple content
- **Risk:** Responsive layout breaks on mobile
  - **Mitigation:** Test each breakpoint during development
- **Risk:** Performance issues with accordion animations
  - **Mitigation:** Use CSS transitions instead of JavaScript where possible

## Security Considerations
- MDX content is sanitized by Astro automatically
- No user input handling in static components
- All content is trusted source (internal content collections)

## Next Steps
- Proceed to Phase 4: Page Composition and Integration
- Prepare components for integration into main page layout