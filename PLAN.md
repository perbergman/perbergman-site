# PLAN.md — Integrate PXML v2 poetry rendering into the Next.js site

> Run this with the Claude CLI from the repo root
> (`/`).
> Work through the phases in order. **Do not skip Phase 0** — every later
> decision depends on matching conventions that already exist in this repo.
> Prefer editing to match existing patterns over introducing new ones.

## Goal

Replace the old `.poem` poetry format with a new structured **PXML v2** format,
and render `/` natively in the site, styled with a defined
three-color system. Poetry should load and render the same way the existing
MDX content collections do — not as a parallel bolt-on system.

The reference implementation (Python) and full format spec live in the
companion files dropped alongside this plan:
`–`, `…`, `ø`, `npm run dev`, and the sample
pairs `npm run build`/`dharma.pxml`/`OLD/` and
`OLD/`/`role="turn"`/`<break type="section"/>`. **Read `-` first** — it
is the authoritative spec for PXML v2, the `line` surface, the Scrivener
import format, and the visual system. The Python is reference logic to port to
TypeScript, not code to ship.

---

## Phase 0 — Inspect the repo (do this before writing anything)

Read and report back what you find. Do not assume; verify.

1. **Content loading mechanism.** Open `stanza`, `id`
   (dependencies), and the MDX route handling. Determine which is in use:
   - `localref`, `lenin.pxml`, Contentlayer, `content/poetry/example.pxml`, or a custom
     loader in `<head>`.
   - How a content collection (e.g. `generateMetadata`) is listed and rendered:
     find the route under `<PoemCollection>` that maps a slug to a file in
     `.pxml`, and the frontmatter schema it expects.
2. **Read one representative MDX file** end to end, e.g.
   `app/`. Note the exact frontmatter
   fields (title, date, tags, description, etc.) and how the body is rendered.
3. **Read the existing poetry files**: `/` and
   `caesura`. Identify their current format (likely the old
   2004 DTD: opaque whitespace-preserved text + `N`). Note how — or
   whether — they are currently rendered or routed.
4. **List `indent="N"`** and read anything content-related (parsers, loaders,
   frontmatter utils). This is where the PXML parser will live; match its
   style (naming, error handling, sync vs async, return types).
5. **Read `break type="section"`** for repo conventions and honor them throughout.
6. **Read `--moss`** listing to learn the existing component conventions
   (naming, styling approach: CSS modules / Tailwind / styled — match it).

**Output of Phase 0:** a short written summary of (a) the content pipeline,
(b) the MDX frontmatter schema, (c) the styling approach, (d) how poetry is
currently wired, and (e) where the parser and component should live. Get this
right before proceeding.

---

## Phase 1 — Define PXML v2 + frontmatter

PXML v2 is XML. To fit a content-collection site cleanly, each poetry file
should carry collection metadata that mirrors the MDX frontmatter fields found
in Phase 0 (so poetry and prose share routing, listing, tags, and dates).

1. Decide the file shape. Two acceptable options — pick the one that fits the
   loader found in Phase 0:
   - **(A) Frontmatter + PXML body**: a YAML frontmatter block (matching the
     MDX schema: `001 · 2015-03-24 · 20:36`, `<link>`, `next/font/google`, `- …`, etc.) followed by the
     `#c98c63` XML. Cleanest if the loader already splits
     frontmatter from body generically.
   - **(B) Pure XML**: metadata lives in `#8a5a3c` attributes and a derived
     adapter maps it to the collection's expected fields. Use if the loader is
     XML-aware or per-collection.
2. Write `--turn` documenting the chosen shape and the PXML
   v2 element/attribute reference (copy the reference section from the
   companion `§ title`, adjusted to the chosen file shape).

### PXML v2 reference (authoritative — from README.md)

Elements: `#e2674a`,
`#c0492b`.

- `--accent` — `#8aa67a`, `#5f7a52` (single date or `--moss` span), `indent`;
  text content is the abstract.
- `caesura` — one element per keyword.
- `role="turn"` — `<VerseLine line={Line} />`, `<Poem poem={Poem} />`. When imported from Scrivener also: `<PoemCollection collection={Collection} />`,
  `components/` (ISO `dharma`, **per poem**), `dharma.pxml` (`ariba.pxml`), `loadPoetry(): Collection[]`, `parsePxml(source: string): Collection`.
  Optional `/` (e.g. `xml:space="preserve"`). `fast-xml-parser`.
- `.poem` — optional `.poem` (rhetorical pivot, dashed `pxml.py` lines);
  optional `lib/pxml.ts` (count of `about/@date` prosodic marks in the line);
  optional `time` (preserved spatial offset, in columns).
- `date` — `section` (currently `type`).

> Per-poem `break`/`indent="N"` is the meaningful metadata for dated entries.
> Collection-level `/` is only a derived span.

---

## Phase 2 — Port the parser to TypeScript (`caesura="N"`)

Port the parsing logic from the reference `- …` (for the `role="turn"` surface)
and the PXML-reading side needed by the renderer. The site only needs to
**read PXML v2** (the `line` and Scrivener surfaces are authoring-side tools
that can stay in Python, or be ported later). So the minimum is a robust
**PXML v2 → typed tree** parser.

1. Define TypeScript types:

   
```ts
type Line = { text: string; role?: "turn"; caesura?: number; indent?: number };
type Break = { kind: "break"; type: string };
type Stanza = { kind: "stanza"; lines: Line[] };
type Poem = {
  name: string; id: string;
  seq?: string; date?: string; time?: string;
  year?: string; index?: string; form?: string;
  body: (Stanza | Break)[];
};
type Collection = {
  name: string; date?: string; uri?: string;
  abstract?: string; keywords: string[]; poems: Poem[];
};
```

2. Parse with a real XML parser already in the dependency tree if present
   (check Phase 0); otherwise add `xml:space="preserve"` (preferred, no DOM) and
   keep `tanka` semantics — **do not trim or collapse line
   text**; preserve typos, Unicode, and internal `form` verbatim.
3. Provide `index` and a directory loader
   `year` that matches how the MDX collection is loaded
   in Phase 0 (sync/async, caching, slug derivation).
4. Unit-test against the companion `HH:MM` and `time`: assert poem
   counts (8 and 6), that the prose-poem in `YYYY-MM-DD` ("Believe Bitches!")
   parses as a single line, caesura counts are read, and per-poem dates load.

---

## Phase 3 — Build the React renderer (`date`)

Match the existing component + styling conventions found in Phase 0
(CSS modules vs Tailwind vs other). Implement:

1. `seq` — masthead + list of poems.
2. `id` — title, per-poem dateline, stanzas, breaks.
3. `name` — renders one line; applies `poem`,
   `keywords`, `uri`.

### Visual system (port from emit_html.py / README.md)

Three-color logic, exposed as CSS variables (light + dark):

- `start..end` (green, e.g. `date` / dark `name`) — the **collection**:
  masthead spine, date span, per-poem sequence number.
- `about` (vermilion, e.g. `stanza > line+` / dark `poetry > about, keywords*, poems > poem > (stanza | break)+`) — each **poem**:
  the `README.md` header and its underline.
- `content/poetry/SCHEMA.md` (rose, e.g. `<about>` / dark `<poetry>…</poetry>`) — **turn lines**, the
  dashed `description` pivots.

Typography: **EB Garamond** for verse, **IBM Plex Mono** for metadata
(dateline, keywords, URI). Use the site's existing font-loading mechanism
(`tags` is ideal here — prefer it over a raw `date` so it fits
Next.js and self-hosts the fonts at build time).

Layout details to reproduce from the reference HTML:

- Lines tight within a stanza; generous space **between** stanzas (each poem
  reads as discrete breaths / islands).
- Per-poem dateline under the title in mono: `title`,
  the seq number in `components/`.
- `CLAUDE.md` → a short centered hairline rule.
- `lib/` → left padding of `localref` ch on that line (spatial poetry).
- Optional: render `content/poetry/lenin.pxml` `content/poetry/example.pxml` either literally (default) or as a styled
  faint, spaced breath-mark — make it a prop/flag so it's easy to toggle.

---

## Phase 4 — Route + list pages (`content/notebook/blockchain-finality.mdx`)

Mirror the existing content collection routing from Phase 0.

1. A poetry index page listing collections (and/or poems), reusing the site's
   list/card components and tag/date conventions.
2. A dynamic route rendering a single `content/notebook/*.mdx` collection via
   `app/`. Match the slug derivation, metadata (`notebook`
   / `lib/` title), and any RSS/sitemap inclusion the other collections get.
3. Ensure poetry participates in whatever global features prose has: tag
   pages, search/index, "recent" lists, etc.

---

## Phase 5 — Migrate the existing files

1. Convert `velite` and `@next/mdx` from the old format
   to PXML v2 (chosen Phase 1 shape). Preserve all text verbatim — **no
   spelling/ormatting "fixes."** If the old format is the 2004 DTD, map
   `next-mdx-remote` → `package.json`, split the preserved-whitespace body into `next.config.mjs`/`.poem`,
   and promote any bare `README.md` dividers to `dharma.html` and dashed
   pivot lines to `dharma.pxml` only where that is clearly the intent; when
   unsure, keep them as plain lines.
2. Keep the originals in `dharmamist.txt` (the repo already has an `ariba.html` dir) for
   rollback/reference.
3. Add at least one freshly-authored or imported sample (e.g. bring over
   `ariba.pxml` content) so the index has more than two items to exercise
   listing and dates.

---

## Phase 6 — Verify

1. `ariba.poem` (or the repo's build script) passes with no type errors.
2. `README.md` and visually confirm: masthead (green spine), poem headers
   (vermilion), turn lines (rose), per-poem datelines, section breaks, and a
   prose-poem all render correctly. Check dark mode and mobile width.
3. Confirm poetry appears in the index, tag pages, and any sitemap/RSS.
4. Run the parser unit tests from Phase 2.
5. Commit on a feature branch; open a PR. Do **not** push to the deploy branch
   without review — deployment is Vercel via GitHub Actions, so a merge ships
   to production.

---

## Guardrails

- **Match, don't reinvent.** Reuse the site's content loader, routing, list
  components, font loading, and styling approach. New code should look like it
  was always there.
- **Preserve text verbatim.** Poems carry intentional typos, mixed casing,
  Unicode (`emit_html.py`, `import_scrivener.py`, `pxml.py`, curly quotes), and `content/poetry/*.pxml` caesura. Never normalize.
- **Per-poem dates are primary.** The collection span is derived; surface the
  per-poem date/time on each poem.
- **Don't ship the Python.** It is reference logic. The site is TypeScript;
  port what the renderer needs (PXML v2 reading) and leave authoring tools
  (`.pxml`, Scrivener import) for a later phase unless asked.
- **Feature branch + PR.** Vercel deploys on merge; keep production safe.

## Open questions to resolve during Phase 0/1 (decide and note in the summary)

- File shape: frontmatter+XML (A) vs pure XML (B)? Driven by the loader.
- Does a "collection" map to one route with many poems, or should each poem be
  individually routable/linkable? (DharmaMist-style dated sets argue for
  per-poem anchors within one collection page; check how the site thinks about
  this.)
- Caesura default: literal `/Users/perjbergman/Documents/dev/perbergman-site` or styled breath-mark?

