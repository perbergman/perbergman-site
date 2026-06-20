# Poetry sources (`content/poetry/_src/`)

These are the **authoring sources** for the poetry collections. The `.pxml`
files one directory up — and the images under `public/poetry/` — are
**generated** from these. Never edit a generated `.pxml` by hand; edit the
source and regenerate.

## Where the files go — one folder per collection

Every collection is a **subfolder** of `_src/` (the folder name is the slug =
the URL `/poetry/<slug>`). Each folder holds exactly **one source file** plus
any **images** it references:

```
content/poetry/_src/
├── README.md                     (this guide — loose files are ignored)
├── ariba/
│   └── ariba.poem                (hand-authored)            → /poetry/ariba
├── lenin/
│   └── lenin.poem
└── dharmamist2015/
    ├── dharmamist2015.md         (Scrivener MultiMarkdown)  → /poetry/dharmamist2015
    └── spooky.jpg                (referenced image, copied to public/)
```

The **source extension picks the converter**:

| Source inside the folder | Converter (`scripts/pxml/`) | Output |
| ------------------------ | --------------------------- | ------ |
| `*.poem`                 | `pxml.py`                   | `content/poetry/<slug>.pxml` |
| `*.md` or `*.txt`        | `import_scrivener.py`       | `content/poetry/<slug>.pxml` |
| `*.jpg`/`*.png`/…        | (copied)                    | `public/poetry/<slug>/…` |

**The folder name sets the year.** A 4-digit year in the folder name (e.g.
`dharmamist2015` → 2015) becomes the collection's year, applied to every poem.
This is **source-agnostic** — it works whether the source is a Scrivener
compile, a Substack export, or a hand-authored `.poem`, none of which reliably
carry the year themselves. (For Scrivener, a `# YYYY #` group header and the
per-poem `YYYY/idx` tails are fallbacks used only when the folder name has no
year.)

There are **no loose top-level source files** — only collection folders and
this README. Each collection page (`/poetry/<slug>`) is a table of contents;
each poem gets its own page (`/poetry/<slug>/<poem-id>`), so a 255-poem set
isn't dumped on one page.

## The loop

```bash
# 1. add/edit a collection folder under _src/ (see formats below)
# 2. regenerate .pxml + public assets (prunes anything orphaned)
npm run poetry:build
# 3. preview
npm run dev          # → http://localhost:3000/poetry/<slug>
# 4. commit the source, the generated .pxml, and any public/ assets
git add content/poetry/_src/<slug> content/poetry/<slug>.pxml public/poetry/<slug>
```

`npm run poetry:check` (use in CI) fails if any committed `.pxml`/asset has
drifted from its source.

---

## A) `.poem` — hand-authored

Quote-free; the layout *is* the structure. One collection per file.

```
about <collection-name> <YYYY-MM-DD> <uri>
  optional abstract, indented

keywords
  zen

poem mouth #mouth
  all thinking created in the mouth
  where inner and outer meets

  reborn every second
  ---
  - to anyone
```

- `about <name> <date> <uri>` — `uri` is one token; abstract on indented lines.
- `keywords` — one per indented line.
- `poem <name> #<id>` — **name is a single token**; verse on 2-space-indented lines.
- blank line = new stanza; `---` = section break; `- ` = turn line; extra indent = spatial offset.

⚠️ `.poem` poem names must be single tokens. Multi-word titles → Scrivener.

---

## B) Scrivener (MultiMarkdown Compile) — `*.md`

Compile from Scrivener with **Format → MultiMarkdown**. A compile that
references an image lands as a **folder** (`.md` + assets) — drop the whole
folder in as the collection. The `.md` must look like:

```
Title: DharmaMist_1111
Author: Per Bergman
## 001 03/24 20:20 Greyhound/Good Morning Mr Buddy Morrow 2015/1 ##
So funny / looking out
----
## 002 03/24 20:36 in the Fog 2015/2 ##
the train in the fog
----
```

- `Title:`/`Author:` (MMD metadata) → collection name / abstract; other metadata is ignored.
- Header line `## <seq> <MM/DD> <HH:MM> <title> <YYYY/idx> ##` (note trailing `##`, usually a Compile Section-Layout title prefix `## ` + suffix ` ##`). **The `YYYY/idx` tail is optional** — the year comes from the folder name (see above), with the `# YYYY #` group header / dominant per-poem year as fallbacks.
- `----` (4+) = poem boundary; `---` (3) = section break; blank line = stanza; `/` = caesura.
- **Images:** a MultiMarkdown image — `![alt][ref]` with `[ref]: file.jpg`, or `![alt](file.jpg)` — on its own line becomes an inline `<image>` in that poem. Put the image file in the collection folder; `poetry:build` copies it to `public/poetry/<slug>/` and the page renders it with `next/image`. (Link-reference definitions are stripped from the verse.)

### Two Scrivener gotchas

1. **Turn off smart dashes** — `--`/`---` becoming `–`/`—` breaks the `----`/`---` separators.
2. **Header preset** — `import_scrivener.py` matches one header grammar (`INNER_RE`). Titles/seq/date/time parse even without the `YYYY/idx` tail; if a poem still shows no date, its header differs more than that — check the first import and adjust `INNER_RE` in `scripts/pxml/import_scrivener.py`.

---

## Which format?

| | `.poem` | Scrivener `*.md` |
| --- | --- | --- |
| poem names | single word only | **multi-word / with `/`** |
| per-poem date/time/seq | no | **yes** |
| inline images | no | **yes** |
| turn lines · spatial indent | yes · yes | no · no |
| how you author it | type the surface | MultiMarkdown Compile |

The canonical format spec + reference back-end live in the sibling toolchain
repo (`../pxml/README.md`); the converters here are vendored copies (see
`scripts/pxml/PROVENANCE.txt`).
