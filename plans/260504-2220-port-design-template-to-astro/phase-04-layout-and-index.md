---
phase: 4
title: "Layout & index page"
status: completed
priority: P1
effort: "20m"
dependencies: [2, 3]
progress: "Completed — Layout and index page composed with all sections wired."
---

# Phase 04: Layout & index page composition

## Overview
Wire global Layout (fonts, global CSS, iconify-icon script, meta tags) and compose all sections in `pages/index.astro`.

## Requirements
- Functional: `/` renders all 7 sections in order. Fonts load. Icons render. Favicon = htlabs logo.
- Non-functional: SEO meta tags present (title, description, og:image).

## Architecture
`Layout.astro` = HTML shell (head, body wrapper). `index.astro` = page-specific (compose components, page title). Global CSS imported once in Layout.

## Related Code Files
- Modify:
  - `src/layouts/Layout.astro` (replace starter content)
  - `src/pages/index.astro` (replace starter content)
- Delete:
  - `src/components/Welcome.astro` (Astro starter)

## Implementation Steps
1. Edit `src/layouts/Layout.astro`:
   ```astro
   ---
   import '../styles/global.css';
   const { title = 'htlabs — Automate Everything' } = Astro.props;
   ---
   <!doctype html>
   <html lang="en">
     <head>
       <meta charset="UTF-8" />
       <meta name="viewport" content="width=device-width, initial-scale=1.0" />
       <link rel="icon" type="image/png" href="/logo.png" />
       <link rel="preconnect" href="https://fonts.googleapis.com" />
       <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
       <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap" />
       <script src="https://code.iconify.design/iconify-icon/2.1.0/iconify-icon.min.js" is:inline></script>
       <title>{title}</title>
       <meta name="description" content="htlabs — operational intelligence and workflow automation." />
     </head>
     <body class="bg-zinc-950 text-zinc-100 min-h-screen">
       <slot />
     </body>
   </html>
   ```
2. Edit `src/pages/index.astro`:
   ```astro
   ---
   import Layout from '../layouts/Layout.astro';
   import Hero from '../components/Hero.astro';
   import WhatWeAutomate from '../components/WhatWeAutomate.astro';
   import CaseStudy from '../components/CaseStudy.astro';
   import Integrations from '../components/Integrations.astro';
   import WorkflowCTA from '../components/WorkflowCTA.astro';
   import PreFooter from '../components/PreFooter.astro';
   import Footer from '../components/Footer.astro';
   ---
   <Layout>
     <Hero />
     <WhatWeAutomate />
     <CaseStudy />
     <Integrations />
     <WorkflowCTA />
     <PreFooter />
     <Footer />
   </Layout>
   ```
3. Delete `src/components/Welcome.astro`.
4. Verify `yarn dev`: full landing page renders, fonts load, icons appear, favicon shows.

## Success Criteria
- [ ] `/` renders all sections in correct order.
- [ ] Inter + JetBrains Mono fonts visibly applied.
- [ ] Favicon = `logo.png`.
- [ ] All `iconify-icon` instances render glyphs (not blank).
- [ ] Page title = "htlabs — Automate Everything".

## Risk Assessment
- **Risk:** iconify-icon script CDN failure → fallback FOUC of empty icons. **Mitigation:** acceptable for now; can self-host later.
- **Risk:** Body bg color conflicts with section bg colors. **Mitigation:** match design-template baseline (`bg-zinc-950`), verify Hero/CaseStudy/PreFooter still look correct.
