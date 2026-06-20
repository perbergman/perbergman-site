#!/usr/bin/env node
// scripts/build-poetry.mjs
//
// Regenerate content/poetry/*.pxml + public/poetry/<slug>/ assets from the
// per-collection source folders in content/poetry/_src/, using the vendored
// Python converters in scripts/pxml/. This is a LOCAL authoring step only — the
// deploy never runs it and only reads the committed .pxml + public assets, so
// there is no Python at build/deploy time.
//
//   npm run poetry:build     regenerate .pxml + assets (and prune orphans)
//   npm run poetry:check     fail if committed output is stale/orphaned (CI guard)
//
// Layout: each collection is a folder content/poetry/_src/<slug>/ with exactly
// one source file plus optional images (slug = folder name = URL):
//   <slug>/*.poem       → pxml.py             → content/poetry/<slug>.pxml
//   <slug>/*.md | *.txt → import_scrivener.py → content/poetry/<slug>.pxml
//   <slug>/*.jpg|png|…  → copied to public/poetry/<slug>/
// Loose files at the _src/ top level (e.g. README.md) are ignored.
import {
  readdirSync, readFileSync, writeFileSync, existsSync,
  statSync, mkdirSync, copyFileSync, rmSync,
} from "node:fs";
import { execFileSync } from "node:child_process";
import { join, dirname, resolve, extname } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const toolsDir = join(repoRoot, "scripts", "pxml");
const srcDir = join(repoRoot, "content", "poetry", "_src");
const outDir = join(repoRoot, "content", "poetry");
const assetDir = join(repoRoot, "public", "poetry");

const CONVERTERS = { ".poem": "pxml.py", ".md": "import_scrivener.py", ".txt": "import_scrivener.py" };
const IMAGE_EXT = new Set([".jpg", ".jpeg", ".png", ".gif", ".webp", ".avif", ".svg"]);

const check = process.argv.includes("--check");
const isDir = (p) => {
  try { return statSync(p).isDirectory(); } catch { return false; }
};

const collections = readdirSync(srcDir)
  .filter((name) => isDir(join(srcDir, name)))
  .sort();

const expected = new Set();
const drift = [];
let wrote = 0;

for (const slug of collections) {
  const dir = join(srcDir, slug);
  const entries = readdirSync(dir);
  const sources = entries.filter((f) =>
    Object.prototype.hasOwnProperty.call(CONVERTERS, extname(f).toLowerCase())
  );
  if (sources.length !== 1) {
    console.error(`  SKIP     ${slug}: expected exactly one source file, found ${sources.length} [${sources.join(", ")}]`);
    process.exitCode = 1;
    continue;
  }
  expected.add(slug);

  const source = sources[0];
  const tool = CONVERTERS[extname(source).toLowerCase()];
  const images = entries.filter((f) => IMAGE_EXT.has(extname(f).toLowerCase()));

  // The folder name is the authoritative year: a 4-digit year in the slug is
  // passed to the Scrivener converter (whose source files can't always carry
  // their own year). Source-agnostic — works the same for any import format.
  const yearMatch = slug.match(/(?:19|20)\d{2}/);
  const yearArg =
    tool === "import_scrivener.py" && yearMatch ? [`--year=${yearMatch[0]}`] : [];

  // Converters take the source as the file arg and write PXML v2 to stdout;
  // progress notes go to stderr, which we pass through.
  const xml = execFileSync("python3", [join(toolsDir, tool), ...yearArg, join(dir, source)], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "inherit"],
  });
  const outPath = join(outDir, `${slug}.pxml`);

  if (check) {
    const current = existsSync(outPath) ? readFileSync(outPath, "utf8") : "";
    const assetsOk = images.every((img) => existsSync(join(assetDir, slug, img)));
    if (current === xml && assetsOk) {
      console.log(`  ok       ${slug}`);
    } else {
      drift.push(slug);
      console.log(`  STALE    ${slug}${current !== xml ? " (pxml)" : ""}${!assetsOk ? " (assets)" : ""}`);
    }
  } else {
    writeFileSync(outPath, xml);
    if (images.length) {
      mkdirSync(join(assetDir, slug), { recursive: true });
      for (const img of images) copyFileSync(join(dir, img), join(assetDir, slug, img));
    }
    const extra = images.length ? `  (+${images.length} image${images.length > 1 ? "s" : ""})` : "";
    console.log(`  wrote    ${slug}.pxml  ←  ${source}${extra}`);
    wrote++;
  }
}

// Keep outputs in sync with sources: prune orphan .pxml and orphan asset dirs.
const orphanPxml = readdirSync(outDir).filter(
  (f) => f.endsWith(".pxml") && !expected.has(f.slice(0, -".pxml".length))
);
const orphanAssets = existsSync(assetDir)
  ? readdirSync(assetDir).filter((d) => isDir(join(assetDir, d)) && !expected.has(d))
  : [];

for (const f of orphanPxml) {
  if (check) { drift.push(f.slice(0, -".pxml".length)); console.log(`  ORPHAN   ${f}`); }
  else { rmSync(join(outDir, f)); console.log(`  removed  ${f}  (no source)`); }
}
for (const d of orphanAssets) {
  if (check) { drift.push(`public/poetry/${d}`); console.log(`  ORPHAN   public/poetry/${d}`); }
  else { rmSync(join(assetDir, d), { recursive: true, force: true }); console.log(`  removed  public/poetry/${d}  (no source)`); }
}

if (check && drift.length) {
  console.error(`\nOut of sync: ${[...new Set(drift)].join(", ")}. Run "npm run poetry:build" and commit.`);
  process.exit(1);
}
console.log(check ? "\nAll collections in sync with _src/." : `\nRegenerated ${wrote} collection(s).`);
