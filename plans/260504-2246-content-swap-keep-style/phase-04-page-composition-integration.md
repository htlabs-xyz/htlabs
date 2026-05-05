---
title: "Phase 4: Page Composition and Integration"
description: "Update index.astro with new section order and clean up obsolete components"
status: pending
priority: P1
effort: 1h
---

## Context Links
- Main plan: `/home/tid/project/htlabs/htlabs/plans/260504-2246-content-swap-keep-style/plan.md`
- Phase 3: `/home/tid/project/htlabs/htlabs/plans/260504-2246-content-swap-keep-style/phase-03-new-content-sections.md`

## Overview
**Priority:** P1  
**Current status:** Not started  
**Brief description:** Update the main index page to use the new section order, integrate all new components, update PreFooter copy, and remove obsolete components and dependencies.

## Key Insights
- Section order must be: Hero → Services → Team → Partners → Portfolio → FAQ → PreFooter → Footer
- Obsolete FlowForge-inspired components must be completely removed
- Three.js dependency can be removed since Hero is now static
- PreFooter copy needs updating to match HT Labs messaging

## Requirements
### Functional Requirements
- Update `src/pages/index.astro` with new component imports and order
- Update PreFooter copy: "Ready to operate AI?" headline with new subhead
- Remove all obsolete component imports and usage
- Clean up unused dependencies from package.json

### Non-functional Requirements
- Maintain same page performance characteristics
- Ensure no broken imports or missing components
- Preserve existing SEO metadata and page structure

## Architecture
### Page Composition Flow
```
Layout
├── Hero (static)
├── Services
├── Team  
├── Partners
├── Portfolio
├── FAQ
├── PreFooter (updated copy)
└── Footer
```

### Dependency Cleanup
- Remove Three.js from dependencies since no longer used
- Remove obsolete component files entirely
- Update import statements in index.astro

## Related Code Files
### Files to Modify
- `src/pages/index.astro` - Complete rewrite of component composition
- `src/components/PreFooter.astro` - Update copy and CTA text

### Files to Delete
- `src/components/WhatWeAutomate.astro`
- `src/components/CaseStudy.astro`
- `src/components/Integrations.astro`
- `src/components/WorkflowCTA.astro`
- `src/components/react/HeroInteractive.jsx`

### Files to Update Dependencies
- `package.json` - Remove three.js and @types/three

## Implementation Steps
1. **Update index.astro**
   - Replace all component imports with new HT Labs components
   - Implement correct section order
   - Remove obsolete component imports
   - Verify all imports resolve correctly

2. **Update PreFooter copy**
   - Change headline to "Ready to operate AI?"
   - Update subhead: "Get started with HT Labs today. Start building operational intelligence at scale."
   - Keep email input + mailto CTA functionality

3. **Delete obsolete components**
   - Remove WhatWeAutomate.astro, CaseStudy.astro, Integrations.astro, WorkflowCTA.astro
   - Remove react/HeroInteractive.jsx

4. **Clean up dependencies**
   - Remove three.js and @types/three from package.json
   - Run `yarn install` to update node_modules

5. **Verify integration**
   - Test that all new components render correctly in page context
   - Check for any console errors or warnings
   - Verify page structure matches design requirements

## Todo List
- [ ] Update src/pages/index.astro with new component imports and order
- [ ] Update PreFooter.astro copy and CTA text
- [ ] Delete obsolete component files
- [ ] Remove three.js dependencies from package.json
- [ ] Verify all components integrate correctly in page context
- [ ] Test page loads without errors

## Success Criteria
- Index page renders all new sections in correct order
- PreFooter displays updated HT Labs copy
- No console errors or missing component warnings
- Three.js dependency completely removed
- Page maintains same performance characteristics

## Risk Assessment
- **Risk:** Missing component imports causing build failures
  - **Mitigation:** Verify all new component paths before updating index.astro
- **Risk:** Breaking changes from dependency removal
  - **Mitigation:** Confirm Three.js is only used in HeroInteractive before removal
- **Risk:** SEO impact from page structure changes
  - **Mitigation:** Preserve existing meta tags and page structure elements

## Security Considerations
- No security implications from component reorganization
- Mailto links remain safe standard practice
- Content remains static with no user input handling

## Next Steps
- Proceed to Phase 5: Testing and Validation
- Prepare for comprehensive testing across all breakpoints