Next.js 16-based blog and content platform built with React 19, TypeScript, Tailwind CSS v4, and Contentlayer2 for MDX content management.

## Development Commands

Use bun for all package management and commands:

```bash
bun dev              # Start development server (uses webpack)
bun run build        # Build for production (uses webpack)
bun start            # Start production server
bun lint             # Run ESLint
```

## Content Management Architecture

### Contentlayer2 Integration

The project uses Contentlayer2 to process MDX files from the `data/` directory into strongly-typed content:

- **Configuration**: `contentlayer.config.ts`
- **Content Types**:
  - `Post`: Blog posts from `data/posts/**/*.mdx`
  - `Project`: Project pages from `data/projects/**/*.mdx`
- **Generated Output**: `.contentlayer/generated/` (gitignored)
- **Auto-generated Files**:
  - `app/tag-data.json`: Tag counts for all posts
  - `public/search.json`: Search index for kbar search

### MDX Processing Pipeline

Content is processed through remark and rehype plugins:

- **Remark** (markdown): GFM, math, code titles, image-to-JSX, GitHub alerts
- **Rehype** (HTML): Slug generation, autolink headings, KaTeX math, citations, Prism syntax highlighting

When modifying content, Contentlayer automatically regenerates the type-safe content during development.

## Project Structure

### Core Directories

- `app/`: Next.js 16 App Router pages and API routes
  - `posts/`: Blog post dynamic routes
  - `projects/`: Project page routes
  - `tags/`: Tag listing pages
  - `proposal/`, `members/`: Custom feature pages
- `components/`: React components organized by scope
  - `app/`: Page-level components (HomePage, ProposalPage, etc.)
  - `common/`: Shared components (Header, Footer, SectionContainer)
  - `ui/`: Reusable UI primitives
- `layouts/`: MDX content layout components
  - `PostLayout.tsx`, `PostSimple.tsx`, `PostBanner.tsx`: Post layouts
  - `ListLayout.tsx`, `ListLayoutWithTags.tsx`: List views
- `data/`: Content and configuration
  - `posts/`, `projects/`: MDX content files
  - `siteMetadata.js`: Site configuration (analytics, comments, search, social links)
  - `headerNavLinks.ts`, `memberData.ts`, `proposalData.ts`: Data files
- `utils/`: Utility functions
- `css/`: Global styles and Tailwind imports
- `public/`: Static assets
- `scripts/`: Build scripts (RSS generation, asset copying)

### Path Aliases

TypeScript is configured with path aliases:
- `@/*` → project root
- `contentlayer/generated` → `.contentlayer/generated`
- `pliny/*` → `node_modules/pliny/*`

## Styling

- **Framework**: Tailwind CSS v4 with `@tailwindcss/postcss` plugin
- **Configuration**: CSS-based configuration via `@import` in `css/tailwind.css`
- **Plugins**: `@tailwindcss/typography` for prose, `@tailwindcss/forms` for forms
- **Font**: Lexend from Google Fonts (variable font)

## Git Workflow

- **Pre-commit Hook**: Husky runs lint-staged (configured in `.husky/pre-commit`)
- **Lint-staged**: Automatically formats and lints staged files before commit
- **Main Branch**: `main` (use for PRs)

## Key Dependencies

- **Next.js**: 16.0.1 with webpack bundler (specified via `--webpack` flag)
- **React**: 19.2.0
- **Contentlayer2**: 0.5.5 for MDX processing
- **pliny**: 0.4.1 for blog utilities (search, analytics, comments)
- **Tailwind CSS**: 4.1.17

## Features Configuration

Edit `data/siteMetadata.js` to configure:
- **Search**: kbar (local search via JSON index)
- **Comments**: Giscus (GitHub Discussions-based)
- **Analytics**: Umami (configured via env vars)
- **Newsletter**: Buttondown

## Building and Deployment

The build process:
1. Contentlayer processes MDX files
2. Next.js builds with webpack
3. Post-build scripts generate RSS and copy assets
4. Security headers are applied (CSP, HSTS, etc.)

Environment variables control build output:
- `EXPORT=true`: Static export mode
- `BASE_PATH`: Base path for deployment
- `UNOPTIMIZED=true`: Disable image optimization
- `ANALYZE=true`: Enable bundle analyzer

## Image Handling

Next.js Image component is configured with remote patterns for:
- GitHub avatars
- Proposal/Project Catalyst assets
- Vercel blob storage
- Picsum photos (placeholder images)

SVG files are handled by `@svgr/webpack` for component imports.

## TypeScript Configuration

- Target: ES6
- Module: ESNext with bundler resolution
- Strict mode: Partially enabled (strict null checks on, but not fully strict)
- JSX: react-jsx (automatic runtime)