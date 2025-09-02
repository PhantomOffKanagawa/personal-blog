# Phantom Works — Astro Theme

Minimal, dark, “spooky mint” theme for personal blogs, technical notes, reviews, tracking, and a portfolio. Built with Astro 5, Tailwind 4, and iconify (line-md and mdi). Compatible with Obsidian Markdown.

## Features

- Dark-first UI with optional light mode (persisted)
- Atomic, reusable components (header, footer, breadcrumbs, TOC, reading progress, theme toggle, search input)
- Blog, Reviews, Tracking content collections with schemas
- Review metadata (tags, allergens, price, stores)
- Obsidian-friendly: images/links within notes, frontmatter validation
- Search via Fuse.js (fuzzy, previews, pagination) at `/search` and header
- Library index with list/icon view and persisted preference
- Tracking landing and aggregated stats page
- 404/500 pages

## Directory overview

- `src/content/blog` — Blog posts (md/mdx)
- `src/content/reviews` — Reviews
- `src/content/tracking` — Runs, workouts, eating logs, etc.
- `src/components` — Atomic UI building blocks
- `src/layouts` — Page layouts (BlogPost, ReviewPost)
- `src/pages` — Routes including `/library`, `/search`, `/tracking`, error pages
- `src/pages/api/search.json.ts` — Search endpoint

## Content schemas

Blog frontmatter:
- title: string
- description: string
- createdDate: date (string coerced)
- updatedDate?: date
- heroImage?: Image
- tags?: string[]
- coverAlt?: string

Reviews frontmatter:
- productName: string
- brand: string
- createdDate: date
- rating: number (1–5)
- productImage?: Image
- tags?: string[]
- allergenInfo?: string[] (GF, DF, etc.)
- price?: number
- stores?: string[]
- imagePath?: string

Tracking frontmatter (example):
- type: 'run' | 'workout' | 'eating' | 'sleep' | 'misc'
- date: date
- distanceKm?: number
- durationMin?: number
- calories?: number
- notes?: string
- tags?: string[]

## Obsidian compatibility

- Place Markdown files under the relevant `src/content/*` folder.
- Local images: use Astro assets (import) or public relative paths. When exporting from Obsidian, copy images into `public/` or import as assets in MDX.
- Links between notes: relative links work as long as the destination is routable. For external or cross-collection links, use absolute `/blog/...` etc.

## Search

- Endpoint: `/api/search.json?q=term&page=1&limit=10` (returns JSON)
- Page: `/search` (uses the API, shows previews, paginates)
- Header search box with Ctrl/Cmd+K focus
- Fuzzy with Fuse.js across blog, reviews, tracking (when present)

## Library index

- `/library` shows all entries from blog and reviews
- Toggle list/icons; preference stored in localStorage (`lib-view`)
- Filter by type via checkboxes

## Tracking

- `/tracking` landing with quick lists for latest runs/workouts
- `/tracking/stats` aggregates distance/duration/calories
- Dynamic entries at `/tracking/[...slug]`

## Theming and customization

- Colors and radii via CSS variables in `src/styles/global.css`
- Accent color: `#41dda9`; swap variables to rebrand quickly
- Theme toggle writes `:root[data-theme]` and persists to localStorage
- Fonts: JetBrains Mono (already included)

## Install and run

```pwsh
npm install
npm run dev
```

Site runs at http://localhost:4321.

## Adding content

1. Create Markdown files:
	- Blog: `src/content/blog/my-post.md`
	- Review: `src/content/reviews/my-review.md`
	- Tracking: `src/content/tracking/2025-09-01-run.md`
2. Include frontmatter per schemas above.
3. For images, import via MDX or place under `public/` and reference `/path`.

## Extending

- Add new content collections in `src/content.config.ts`.
- Build new atomic components in `src/components` and slot them into layouts/pages.
- For more complex search facets, enhance the search API to compute tag/type filters server-side.

## Notes

- This theme focuses on desktop but maintains responsive layouts.
- Animations are minimal; add Tailwind transitions as needed.
- Icon sets used: line-md and mdi (via `astro-icon`).
