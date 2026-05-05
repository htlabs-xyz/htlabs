---
title: "Phase 2: Static Hero Implementation"
description: "Convert Hero component from Three.js interactive to static HT Labs hero"
status: pending
priority: P1
effort: 1.5h
---

## Context Links
- Main plan: `/home/tid/project/htlabs/htlabs/plans/260504-2246-content-swap-keep-style/plan.md`
- Phase 1: `/home/tid/project/htlabs/htlabs/plans/260504-2246-content-swap-keep-style/phase-01-setup-content-collections.md`

## Overview
**Priority:** P1  
**Current status:** Not started  
**Brief description:** Replace the current Three.js-powered HeroInteractive component with a static Hero component featuring HT Labs copy and maintaining the existing visual style.

## Key Insights
- Current Hero uses Three.js for interactive particle system that needs complete removal
- New hero should maintain visual hierarchy and style tokens (zinc-950, orange accent, glass effects)
- Navigation structure can be simplified since we're removing the interactive controls

## Requirements
### Functional Requirements
- Remove Three.js dependency entirely from Hero component
- Implement new HT Labs copy: "Comprehensive AI. End-to-end."
- Add status pill showing "● Accepting projects"
- Maintain existing grid overlay and background effects
- Preserve responsive layout behavior

### Non-functional Requirements
- Reduce bundle size by removing Three.js from hero
- Maintain same performance characteristics
- Keep identical visual styling and animations

## Architecture
### Component Structure
The new Hero component will be a pure Astro component with:
- Static HTML/CSS structure
- Same grid overlay background
- Identical typography and spacing
- Simplified navigation without demo booking
- New copy and CTA structure

### Data Flow
- No external data dependencies (static content only)
- Direct mailto link for contact CTA
- Status indicator as static element

## Related Code Files
### Files to Modify
- `src/components/Hero.astro` - Complete rewrite
- `src/components/react/HeroInteractive.jsx` - Will be deleted in Phase 4

### Files to Delete (Phase 4)
- `src/components/react/HeroInteractive.jsx`

## Implementation Steps
1. **Backup current Hero component**
   - Save current implementation for reference if needed

2. **Create new static Hero structure**
   - Remove Three.js import and HeroInteractive usage
   - Implement new copy structure with eyebrow, headline, subhead
   - Add status pill with "● Accepting projects"

3. **Update navigation**
   - Simplify navigation links (remove Book Demo button)
   - Update logo and branding elements

4. **Implement new CTA**
   - Replace "Initialize System" with "Contact Us"
   - Link directly to mailto:htlabs.xyz@gmail.com
   - Maintain same visual styling

5. **Preserve visual elements**
   - Keep grid overlay background
   - Maintain orange blur effect
   - Preserve bottom protocol/version indicators

6. **Test responsiveness**
   - Verify mobile layout works correctly
   - Ensure all breakpoints (sm/md/lg) display properly

## Todo List
- [ ] Remove Three.js import from Hero.astro
- [ ] Implement new HT Labs copy structure
- [ ] Add status pill "● Accepting projects"
- [ ] Update CTA to "Contact Us" with mailto link
- [ ] Simplify navigation structure
- [ ] Preserve visual styling and animations
- [ ] Test responsive behavior

## Success Criteria
- Hero component renders without Three.js errors
- New copy matches design specifications exactly
- Visual styling is identical to existing design language
- Mobile responsiveness works at all breakpoints
- Mailto link functions correctly

## Risk Assessment
- **Risk:** Removing Three.js may break other components if shared
  - **Mitigation:** Verify Three.js is only used in HeroInteractive before removal
- **Risk:** Visual styling inconsistencies with new static implementation
  - **Mitigation:** Copy exact CSS classes and structure from current implementation

## Security Considerations
- Mailto link is safe and standard practice
- No user input handling required in static hero

## Next Steps
- Proceed to Phase 3: New Content Sections
- Prepare for integration with content collections from Phase 1