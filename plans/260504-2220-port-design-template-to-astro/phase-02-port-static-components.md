---
phase: 2
title: "Port static components"
status: completed
priority: P1
effort: "1h"
dependencies: [1]
progress: "Completed — 6 static React components ported to .astro files."
---

# Phase 02: Port static components

## Overview
Mechanically convert 6 static React components to `.astro` files. Pure markup transformation — no behavior changes.

## Requirements
- Functional: each `.astro` file renders identical DOM to its `.jsx` source.
- Non-functional: ship 0 JS for these sections.

## Architecture
Each `.astro` file = pure HTML template. No props for now (single landing). Tailwind classes preserved verbatim. `iconify-icon` JSX written as plain HTML (it's a custom element).

## Related Code Files
- Create (Astro convention = PascalCase):
  - `src/components/WhatWeAutomate.astro`
  - `src/components/CaseStudy.astro`
  - `src/components/Integrations.astro`
  - `src/components/WorkflowCTA.astro`
  - `src/components/PreFooter.astro`
  - `src/components/Footer.astro`
- Read for reference (do not modify):
  - `design-template/components/WhatWeAutomate.jsx`
  - `design-template/components/CaseStudy.jsx`
  - `design-template/components/Integrations.jsx`
  - `design-template/components/WorkflowCTA.jsx`
  - `design-template/components/PreFooter.jsx`
  - `design-template/components/Footer.jsx`

## Implementation Steps
For each source `.jsx`:
1. Create new `.astro` file (PascalCase per Astro convention; matches source filename).
2. Copy JSX return body inside `---\n---\n` (empty frontmatter — no script needed).
3. Apply transforms:
   - `className=` → `class=`
   - `style={{ propName: 'value' }}` → `style="prop-name: value"` (kebab-case CSS props)
   - `<iconify-icon ... />` → keep as-is (already valid HTML custom element); convert self-closing to `<iconify-icon ...></iconify-icon>` if Astro complains
   - Remove `import React`
   - Remove function wrapper `const X = () => { return ( ... ); }; export default X;`
4. Verify rendering via `yarn dev` by importing into a temp test page.

## Success Criteria
- [ ] All 6 `.astro` files exist and contain no JSX-specific syntax (`className`, `style={{}}`).
- [ ] Each component renders without console errors.
- [ ] Visual diff vs `design-template` dev server: identical layout/styling for each section.

## Risk Assessment
- **Risk:** `style={{}}` objects with computed values (rare in static components). **Mitigation:** scan for them during port; convert to expression `style={`...`}` if needed.
- **Risk:** Astro's stricter HTML may reject self-closing custom elements. **Mitigation:** use explicit closing tags.
- **Risk:** `iconify-icon` not yet registered when component renders → blank icons. **Mitigation:** Phase 04 ensures script in Layout.

## Notes
- Defer copy rewrite to Phase 05 — keep original FlowForge text for now to enable visual diff.
