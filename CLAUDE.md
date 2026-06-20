# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- **Development server**: `npm run dev` - Next.js dev server on http://localhost:3000
- **Build**: `npm run build` - Production build
- **Production server**: `npm start` - Serves the production build locally
- **Linting**: `npm run lint` - ESLint with `eslint-config-next`

There is no test framework configured in this repo — `lint` and `build` are the only verification gates.

## Architecture Overview

Next.js 16 personal portfolio site using the App Router with React Server Components. Content is discovered dynamically from files on disk; there is no CMS or database. Adding a content file is the only step needed to publish a page.

### Two separate content pipelines

The repo has **two distinct content systems** that do not share code — keep them straight:

1. **MDX sections** (`notebook`, `art`, `writing`, `systems`) — handled by `lib/mdx.ts`.
   - Files live in `content/{section}/*.mdx` with `gray-matter` frontmatter (`title`, optional `date`, optional `summary`).
   - Routed by **catch-all** `app/{section}/[...slug]/page.tsx`, so nested paths like `content/notebook/a/b.mdx` → `/notebook/a/b` work. `getAllEntriesForSection` walks subfolders **recursively**, so grouped/nested `.mdx` is both listed and routed (relative path = slug; dot/`_`-prefixed dirs are skipped).
   - The `ContentSection` type in `lib/mdx.ts` is `"notebook" | "art" | "writing" | "systems"` — **poetry is deliberately excluded** here.

2. **Poetry** (`poetry`) — handled by `lib/pxml.ts`, a completely separate parser.
   - Files live in `content/poetry/*.pxml` — **PXML v2**, a structured XML format (`<poetry><about><poems><poem>` → `<stanza><line>` / `<break>` / `<image>`) parsed with `xml2js` into a typed `Collection` tree, **not** MDX. See PXML v2 below.
   - `lib/pxml.ts` exposes `parsePxml(source) → Collection`, the `lib/mdx.ts`-style loaders `getAllCollections()` / `getCollectionBySlug(slug)`, and `getImageSize()` (reads `public/poetry/<slug>/<src>` dimensions for `next/image`).
   - Routed by `app/poetry/[slug]/page.tsx` (collection index / table of contents) **and** `app/poetry/[slug]/[poem]/page.tsx` (one poem, with prev/next). A collection is one `.pxml` holding many `<poem>`s; the poem page selects by `id`. This is how large sets (e.g. the 255-poem DharmaMist) avoid rendering on a single page.
   - Rendered by `components/Poetry.tsx` (`CollectionIndex` + `PoemPage`), not `Mdx.tsx`.

When adding a new MDX-style section, mirror an existing one: add `content/{section}/`, `app/{section}/page.tsx` (index), `app/{section}/[...slug]/page.tsx` (detail), and extend the `ContentSection` union plus add a `getAll{Section}Entries()` helper in `lib/mdx.ts`.

### Next.js 16 routing gotcha (cause of recent churn)

In Next.js 16, dynamic route `params` is a **`Promise`** and must be awaited:

```ts
type Props = { params: Promise<{ slug?: string[] }> };
const { slug } = await params;
```

Every page in `app/**/[...slug]/page.tsx` and `app/poetry/[slug]/page.tsx` follows this pattern. The recent commit history is almost entirely fixes for this and for hidden/dot-prefixed example files breaking content discovery — be careful that any new content file is a normal (non-hidden) `.mdx`/`.pxml` file, since `lib/mdx.ts` simply reads every directory entry ending in `.mdx`.

### Rendering pipeline

- **MDX** → `components/Mdx.tsx` uses `next-mdx-remote/rsc` (`MDXRemote`) with `remark-gfm`, `rehype-slug`, and `rehype-autolink-headings`. Element overrides are defined inline in this file.
- **Mermaid** → fenced ```` ```mermaid ```` code blocks are intercepted in the `pre` override of `Mdx.tsx` and rendered via `components/Mermaid.tsx` (client component) instead of as a code block.
- **Images** → the `img` override maps Markdown images to `next/image`. `next.config.mjs` allows remote images from **any** https host (`hostname: '**'`).

### Styling — important

There is **no Tailwind or PostCSS in this project** (check `package.json` / absence of `tailwind.config.*`). Despite this, `components/Mdx.tsx` contains Tailwind-looking utility classes (`text-3xl`, `bg-neutral-900/70`, etc.) — **these are inert and have no effect.** All real styling comes from:

- `app/globals.css` — CSS custom properties (`--bg`, `--fg`, `--accent`, …) defining a dark theme, plus semantic class selectors like `.card`, `.mermaid-diagram`, and the `.pxml*` poetry block.

When changing how content looks, edit `app/globals.css`, not the utility classes in `Mdx.tsx`. Poetry fonts (EB Garamond verse, IBM Plex Mono metadata) are loaded via `next/font/google` in `app/layout.tsx`, exposed as `--font-verse` / `--font-mono`.

### PXML v2 poetry (implemented)

Poetry is **PXML v2** — a structured XML IR (stanzas, `line` with `caesura`/`role="turn"`/`indent`, `break`, and **per-poem** `date`/`time`/`seq`). `lib/pxml.ts` reads it into a typed `Collection` tree; `components/Poetry.tsx` renders it with the three-color visual system (green = collection spine/seq, vermilion = poem header, rose = turn lines). Parser + renderer + routes + fonts are done (PLAN.md Phases 2–4).

- **Authoring pipeline — never hand-write `.pxml`.** The `.pxml` files are generated; edit the sources instead:
  - Sources live in `content/poetry/_src/` (`<slug>.poem` or `<slug>.scriv.txt`). Converters are vendored in `scripts/pxml/` (`pxml.py` for `.poem`, `import_scrivener.py` for Scrivener) — verbatim copies from the toolchain (provenance in `scripts/pxml/PROVENANCE.txt`).
  - **`npm run poetry:build`** regenerates `content/poetry/*.pxml` (+ copies images to `public/poetry/<slug>/`) from `_src/`; **`npm run poetry:check`** fails on drift (CI guard). This is a **local authoring step only** — it never runs at deploy, so there is no Python on Vercel; the deploy just reads the committed `.pxml` + assets.
  - **The collection year comes from the folder name** (a 4-digit year in the slug → `--year` for `import_scrivener.py`). Source-agnostic (Scrivener/Substack/`.poem`); fallbacks are a `# YYYY #` header then the dominant per-poem year. `import_scrivener.py`'s `INNER_RE` tolerates headers missing the `YYYY/idx` tail.
  - The full spec + reference back-end (`emit_html.py`, which the TS parser/renderer were ported from) live in the sibling repo `~/Documents/dev/pxml`; see `../pxml/README.md` for the pipeline.
  - Each collection is a folder `content/poetry/_src/<slug>/` with one source file (`*.poem` or `*.md`/`*.txt`) + optional images. Current: `ariba`/`lenin` (`.poem`), `dharmamist2015` (Scrivener MMD, 255 poems + inline image). The old 2004-DTD demo `example.pxml` was dropped (backup in gitignored `OLD/*.legacy.pxml`).
- **Hard invariants** (from `PLAN.md`, do not violate):
  - **Preserve poem text verbatim** — intentional typos, mixed casing, Unicode, em-dashes, internal whitespace, and literal caesura `/`. Never trim, collapse, or "correct."
  - **Per-poem dates are primary**; the collection-level date span is derived.
  - **Remaining (Phase 5):** migrate the rest of the corpus — drop each source in `_src/` and run `npm run poetry:build` (note: `pxml.py`'s `.poem` surface only supports single-token poem names; multi-word names need the Scrivener path).
  - Work on a **feature branch + PR**. Deployment is Vercel on merge, so merging to the deploy branch ships to production.

### TypeScript Configuration

- Strict mode; path alias `@/*` → repo root (`./`).
- `allowJs: false`, `moduleResolution: "bundler"`.
