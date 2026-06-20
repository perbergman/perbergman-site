// lib/pxml.ts - PXML parser for poetry files
import fs from "fs";
import path from "path";
import { Parser } from "xml2js";

const POETRY_DIR = path.join(process.cwd(), "content", "poetry");

// ---------------------------------------------------------------------------
// PXML v2 — canonical typed tree (the format produced by ~/Documents/dev/pxml)
//
// This is the port of the Python reference reader (emit_html.py) to TypeScript.
// The site only needs to *read* PXML v2; the authoring/import tools (pxml.py,
// import_scrivener.py) stay in Python. Text is preserved verbatim: typos,
// mixed casing, Unicode and internal whitespace are never trimmed or collapsed.
// ---------------------------------------------------------------------------

export type Line = {
  text: string;
  role?: "turn";
  caesura?: number;
  indent?: number;
};

export type Break = { kind: "break"; type: string };

export type Image = { kind: "image"; src: string; alt?: string };

export type Stanza = { kind: "stanza"; lines: Line[] };

export type Poem = {
  name: string;
  id: string;
  seq?: string;
  date?: string;
  time?: string;
  year?: string;
  index?: string;
  form?: string;
  body: (Stanza | Break | Image)[];
};

export type Collection = {
  name: string;
  date?: string;
  uri?: string;
  abstract?: string;
  keywords: string[];
  poems: Poem[];
};

export type CollectionMeta = {
  slug: string;
  name: string;
  date?: string;
  uri?: string;
  poemCount: number;
};

/**
 * Parse a PXML v2 document synchronously.
 *
 * `explicitChildren` + `preserveChildrenOrder` are required so that the
 * `(stanza | break)+` body keeps document order (a section break sits between
 * specific stanzas — see the "nothing" poem). `trim`/`normalize` are disabled
 * so line text stays byte-for-byte; abstract/keyword text is trimmed only
 * because their surrounding indentation is XML pretty-printing, not content.
 */
function parsePxmlTree(source: string): any {
  let parsed: any = null;
  let error: Error | null = null;

  new Parser({
    explicitArray: true,
    explicitChildren: true,
    preserveChildrenOrder: true,
    charsAsChildren: false,
    trim: false,
    normalize: false,
  }).parseString(source, (err: Error | null, result: any) => {
    error = err;
    parsed = result;
  });

  if (error) throw error;
  return parsed;
}

function buildLine(el: any): Line {
  // A text-only <line> with no attributes can collapse to a bare string.
  if (typeof el === "string") return { text: el };

  const attrs = el?.$ ?? {};
  const line: Line = { text: typeof el?._ === "string" ? el._ : "" };

  if (attrs.role === "turn") line.role = "turn";

  const caesura = Number(attrs.caesura);
  if (attrs.caesura !== undefined && Number.isFinite(caesura)) {
    line.caesura = caesura;
  }

  const indent = Number(attrs.indent);
  if (attrs.indent !== undefined && Number.isFinite(indent)) {
    line.indent = indent;
  }

  return line;
}

function buildBody(poemEl: any): (Stanza | Break | Image)[] {
  const children: any[] = Array.isArray(poemEl?.$$) ? poemEl.$$ : [];
  const body: (Stanza | Break | Image)[] = [];

  for (const child of children) {
    if (child["#name"] === "stanza") {
      const lineEls: any[] = Array.isArray(child.$$)
        ? child.$$.filter((c: any) => c["#name"] === "line")
        : Array.isArray(child.line)
          ? child.line
          : [];
      body.push({ kind: "stanza", lines: lineEls.map(buildLine) });
    } else if (child["#name"] === "break") {
      body.push({ kind: "break", type: child?.$?.type ?? "" });
    } else if (child["#name"] === "image") {
      const attrs = child?.$ ?? {};
      const image: Image = { kind: "image", src: attrs.src ?? "" };
      if (attrs.alt) image.alt = attrs.alt;
      body.push(image);
    }
  }

  return body;
}

function buildPoem(el: any): Poem {
  const a = el?.$ ?? {};
  const poem: Poem = {
    name: a.name ?? "",
    id: a.id ?? "",
    body: buildBody(el),
  };

  if (a.seq) poem.seq = a.seq;
  if (a.date) poem.date = a.date;
  if (a.time) poem.time = a.time;
  if (a.year) poem.year = a.year;
  if (a.index) poem.index = a.index;
  if (a.form) poem.form = a.form;

  return poem;
}

/**
 * Parse a PXML v2 source string into a typed Collection tree.
 */
export function parsePxml(source: string): Collection {
  const root = parsePxmlTree(source)?.poetry;
  if (!root) {
    throw new Error("Invalid PXML: missing <poetry> root element");
  }

  const aboutEl = root.about?.[0];
  const aboutAttrs = aboutEl?.$ ?? {};
  const abstract =
    typeof aboutEl?._ === "string" ? aboutEl._.trim() : "";

  const keywords: string[] = Array.isArray(root.keywords)
    ? root.keywords
        .map((k: any) =>
          (typeof k === "string" ? k : typeof k?._ === "string" ? k._ : "").trim()
        )
        .filter((s: string) => s.length > 0)
    : [];

  const poemEls = root.poems?.[0]?.poem;
  const poems = Array.isArray(poemEls) ? poemEls.map(buildPoem) : [];

  const collection: Collection = {
    name: aboutAttrs.name ?? "",
    keywords,
    poems,
  };

  if (aboutAttrs.date) collection.date = aboutAttrs.date;
  if (aboutAttrs.uri) collection.uri = aboutAttrs.uri;
  if (abstract) collection.abstract = abstract;

  return collection;
}

/**
 * Directory loader — mirrors lib/mdx.ts: synchronous, filename → slug,
 * reads every `.pxml` under content/poetry/.
 */
export function loadPoetry(): Collection[] {
  if (!fs.existsSync(POETRY_DIR)) return [];

  return fs
    .readdirSync(POETRY_DIR)
    .filter((file) => file.endsWith(".pxml"))
    .map((file) =>
      parsePxml(fs.readFileSync(path.join(POETRY_DIR, file), "utf-8"))
    );
}

/**
 * Collection metadata (no poem bodies), sorted newest-first by collection date.
 */
export function getAllCollections(): CollectionMeta[] {
  if (!fs.existsSync(POETRY_DIR)) return [];

  return fs
    .readdirSync(POETRY_DIR)
    .filter((file) => file.endsWith(".pxml"))
    .map((file) => {
      const slug = file.replace(/\.pxml$/, "");
      const collection = parsePxml(
        fs.readFileSync(path.join(POETRY_DIR, file), "utf-8")
      );

      const meta: CollectionMeta = {
        slug,
        name: slug,
        poemCount: collection.poems.length,
      };
      if (collection.date) meta.date = collection.date;
      if (collection.uri) meta.uri = collection.uri;
      return meta;
    })
    .sort((a, b) => {
      if (a.date && b.date) return a.date > b.date ? -1 : 1;
      return 0;
    });
}

/**
 * Load a single PXML v2 collection by slug (filename without extension).
 */
export function getCollectionBySlug(slug: string): Collection | null {
  const filePath = path.join(POETRY_DIR, `${slug}.pxml`);
  if (!fs.existsSync(filePath)) return null;
  const collection = parsePxml(fs.readFileSync(filePath, "utf-8"));
  // The folder name IS the collection name (verbatim) — the inside Title is ignored.
  collection.name = slug;
  return collection;
}

/**
 * Read the intrinsic pixel dimensions of a poem image from public/poetry/<slug>/.
 * Dependency-free header parse for PNG / GIF / JPEG; returns null for anything
 * else (SVG/WebP/AVIF) so the renderer can fall back to a responsive layout.
 */
export function getImageSize(
  slug: string,
  src: string
): { width: number; height: number } | null {
  const filePath = path.join(process.cwd(), "public", "poetry", slug, src);
  if (!fs.existsSync(filePath)) return null;
  const buf = fs.readFileSync(filePath);

  // PNG: dimensions follow the IHDR chunk type at byte 12.
  if (buf.length >= 24 && buf.toString("ascii", 12, 16) === "IHDR") {
    return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
  }
  // GIF: little-endian width/height at byte 6.
  if (buf.length >= 10 && buf.toString("ascii", 0, 3) === "GIF") {
    return { width: buf.readUInt16LE(6), height: buf.readUInt16LE(8) };
  }
  // JPEG: scan segment markers for a Start-Of-Frame (SOFn).
  if (buf.length >= 2 && buf[0] === 0xff && buf[1] === 0xd8) {
    let o = 2;
    while (o + 9 < buf.length) {
      if (buf[o] !== 0xff) {
        o++;
        continue;
      }
      const marker = buf[o + 1];
      const isSOF =
        marker >= 0xc0 &&
        marker <= 0xcf &&
        marker !== 0xc4 &&
        marker !== 0xc8 &&
        marker !== 0xcc;
      if (isSOF) {
        return { height: buf.readUInt16BE(o + 5), width: buf.readUInt16BE(o + 7) };
      }
      o += 2 + buf.readUInt16BE(o + 2);
    }
  }
  return null;
}
