---
type: brainstorm
date: 2026-05-04
slug: htlabs-landing-page
status: approved
---

# HT Labs Landing Page — Brainstorm Report

## Problem Statement

Build the marketing landing page for HT Labs (`htlabs.xyz`). Site introduces company, shows team (6), services, partners, portfolio (gym), and FAQ. Single-page, English, dark/minimal style ported from `design-template/` (FlowForge React/Vite → port to existing Astro repo).

## Positioning

**HT Labs — Comprehensive AI solutions for businesses.**
End-to-end: strategy → infrastructure → agents → integration → operations. Flagship offering: AI Agents & Automation. Target: businesses doing digital transformation / AI adoption.

## Decisions (locked)

| Area | Decision |
|---|---|
| Stack | Astro 6 + Tailwind 3 + iconify-icon + Astro Content Collections (MDX) |
| Style source | Port `design-template/` (React) styles to Astro |
| Style | Dark `zinc-950`, orange `#f97316` primary, blue `#3b82f6` secondary, Inter + JetBrains Mono |
| Language | English only |
| Contact | `mailto:htlabs.xyz@gmail.com` (no backend) |
| Deploy | Vercel (static), domain `htlabs.xyz` |
| Animations | scroll fade-in only (no Three.js) |
| Logo | `/logo.png` — sunrise-over-water (orange + blue) |
| Tagline | **Comprehensive AI. End-to-end.** |
| Founded | 2026 (new — no fake stats) |

## Style Rules Ported from design-template

- Tokens: `bg-zinc-950`, text `zinc-100/400/500`, accent `#f97316`, secondary `#3b82f6`
- Effects: `.tech-glass`, `.grid-overlay`, `.bg-mesh`, `.animate-fade-in`, `.animate-flow`
- Card pattern: `rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10`
- Headings: 2-tone giant (`text-5xl→8xl tracking-tighter font-medium`)
- Eyebrow: `● UPPERCASE MONO LABEL`
- CTA: white pill button + status pill
- Fonts: Inter (sans), JetBrains Mono (mono accents)
- **Drop:** Three.js canvas, live "Flux Dynamics" control panel, "Protocol v4.0.1" gimmick chrome

## Page Structure

### Header (sticky)
HT logo + nav (`About / Team / Portfolio / Contact`) + Contact CTA (`mailto:htlabs.xyz@gmail.com`)

### Section 1 — Hero
- Eyebrow: `● HT LABS / COMPREHENSIVE AI`
- Headline (2-tone): **Comprehensive AI.** *End-to-end.*
- Subhead: *"From infrastructure to agents to integration — we deliver complete AI solutions for businesses ready to operate with intelligence."*
- CTA: `Contact Us` → mailto + status pill `● Accepting projects`
- Background: grid-overlay + orange + blue radial glow (matches logo palette)

### Section 2 — Services (capability-led intro + 4 cards)
Intro: *"HT Labs delivers end-to-end AI solutions — infrastructure, agents, integration, and strategy — so businesses can adopt AI without juggling multiple vendors."*

| # | Card | Description |
|---|---|---|
| 1 (featured, accent border) | **AI Agents & Automation** | Custom agents, RAG systems, workflow automation that runs production ops |
| 2 | **AI Infrastructure** | LLM hosting, vector DBs, MLOps pipelines, GPU/cloud setup |
| 3 | **System Integration** | Connect AI into CRM, ERP, internal tools — data pipelines, APIs |
| 4 | **AI Strategy & Advisory** | Roadmap, team training, change management |

### Section 3 — Team (6 cards, 3×2)
| # | Name | Role |
|---|---|---|
| 1 | Vi Van Bảo | Business Development |
| 2 | Phung Tien Dũng | Tech Lead / Solution Architect |
| 3 | Dang Quang Thanh | Software Architect |
| 4 | Nguyen Hong Son | AI Engineer |
| 5 | Coming Soon | Data / MLOps Engineer |
| 6 | Coming Soon | DevOps Engineer |

Card: avatar (placeholder if missing), name, mono uppercase role, socials (LinkedIn/GitHub) — placeholders until provided.

### Section 4 — Partners
Grayscale glass logo strip. Currently placeholders ("Coming soon"). 4–6 slots, opacity 60→100 on hover.

### Section 5 — Portfolio
Featured large card: **Gym project** (cover, tags, summary). 2 placeholder slots labeled "Coming soon".

### Section 6 — FAQ
`<details>` accordion in glass cards. 6 Q&A drafted (see report).

### Pre-footer CTA
`bg-mesh` band: *"Ready to operate AI?"* → `mailto:htlabs.xyz@gmail.com`

### Footer
HT logo + nav + © 2026 HT Labs + mono `v0.1 · htlabs.xyz`

## File Layout (target Astro repo `/home/tid/project/htlabs/htlabs/`)

```
src/
  content/
    config.ts                # Zod schemas
    team/*.md                # 4 real + 2 placeholders
    services/*.mdx           # 4 cards
    partners/*.md            # placeholders
    portfolio/gym.mdx        # featured + 2 placeholders
    faq/*.md                 # 6 entries
  components/
    layout/Header.astro
    layout/Footer.astro
    layout/SectionShell.astro
    sections/Hero.astro
    sections/Services.astro
    sections/Team.astro
    sections/Partners.astro
    sections/Portfolio.astro
    sections/Faq.astro
    sections/PreFooterCta.astro
    ui/Button.astro
    ui/Card.astro
    ui/StatusPill.astro
    ui/EyebrowLabel.astro
  layouts/Layout.astro       # head, fonts, SEO, OG
  pages/index.astro          # composes sections
  styles/globals.css         # ported from design-template/index.css
public/
  logo.png                   # already present (move from /logo.png if needed)
  favicon.svg
  og.png
  images/team/, partners/, portfolio/
tailwind.config.mjs          # extends from design-template
astro.config.mjs             # add @astrojs/tailwind, @astrojs/mdx
```

## FAQ Content (drafted)

1. **What does "comprehensive AI" mean at HT Labs?** — Every layer (strategy → infra → models → agents → integration → ops) under one partner.
2. **Build models from scratch or integrate existing?** — Integrate by default (OpenAI/Anthropic/OSS); custom training only when ROI is clear.
3. **Typical timeline?** — Pilot 3–6 weeks; production integration 2–4 months; transformation programs phased.
4. **Ongoing support?** — Yes — managed ops, monitoring, tuning, model upgrades.
5. **Industries?** — Operations-heavy SMBs: services, ecommerce, fitness, logistics.
6. **How to start?** — Email `htlabs.xyz@gmail.com`; reply 1–2 business days; free discovery call.

(Full text in earlier brainstorm reply.)

## Approaches Evaluated

| Approach | Pros | Cons | Verdict |
|---|---|---|---|
| Astro + Tailwind + shadcn | Static, fast SEO, type-safe content | shadcn React-first → port primitives | ✅ chosen |
| Astro + Tailwind only | Simpler | Reinvent UI primitives | rejected |
| Migrate to Next.js | Future dynamic features | Overkill for static landing | rejected |
| Port full design-template (incl. Three.js) | Stunning hero | 200KB+ deps, mobile perf, no business value | rejected |
| Hardcoded data files (TS/JSON) | Simple | Less authoring ergonomics | rejected for collections |
| Astro Content Collections (MDX) | Type-safe, MDX rich content | Slight schema setup | ✅ chosen |

## Risks / Mitigations

| Risk | Mitigation |
|---|---|
| Empty partner section looks weak | Use "Coming soon" glass cards; remove if launch close & no logos |
| Only 1 portfolio item (gym) | Featured-large layout + 2 "Coming soon" cards looks intentional |
| 2 missing team members visible | "Coming soon" cards signal hiring, acceptable |
| iconify-icon CDN dep | Self-host icons via `@iconify/json` if perf concern |
| `htlabs.xyz@gmail.com` as primary contact = unprofessional vs `hello@htlabs.xyz` | Optional later upgrade; functional now |
| No real photos for team | Use monogram avatars (initials on accent bg) until photos provided |

## Success Criteria

- Lighthouse: Performance ≥ 95, Accessibility ≥ 95, SEO ≥ 95
- LCP < 2.5s on 4G mobile
- All sections render w/ placeholder data; replacing data needs no code change
- Mobile responsive (sm / md / lg breakpoints from template)
- `mailto:htlabs.xyz@gmail.com` clickable from all CTAs
- OG image renders correctly when shared

## Next Steps

1. `/ck:plan` — generate phased implementation plan from this report
2. Phase order: setup tooling → port styles/tokens → build layout shell → sections (Hero → Services → Team → Partners → Portfolio → FAQ → PreFooter → Footer) → SEO/OG → deploy

## Unresolved Questions

1. Real avatars for the 4 named team members — when available?
2. Real partner logos — any to add at launch, or keep all placeholders?
3. Gym portfolio: cover image, client name (public or "Confidential"), any metrics to publish?
4. LinkedIn/GitHub URLs for each named team member?
5. OG image — bespoke design or generated from logo + tagline?
6. Logo usage on dark bg — does current `/logo.png` need a light/inverse variant? (orange+blue may need stroke/glow on dark)
7. Upgrade `htlabs.xyz@gmail.com` → `hello@htlabs.xyz` later?
