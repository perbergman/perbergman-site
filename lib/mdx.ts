// lib/mdx.ts
import fs from "fs";
import path from "path";
import matter from "gray-matter";

const contentDir = path.join(process.cwd(), "content");

export type ContentEntry = {
  slug: string;
  content: string;
  frontMatter: Record<string, any>;
};

export type ContentMeta = {
  slug: string;
  title: string;
  date?: string;
  summary?: string;
};

export type ContentSection = "notebook" | "art" | "writing" | "systems";

/**
 * Recursively collect every `.mdx` file under a directory, returning paths
 * relative to it (POSIX-separated). Subfolders let content be grouped
 * (e.g. by year); the relative path becomes the slug. Hidden/underscore-
 * prefixed entries are skipped (dotfiles, `_src`-style authoring dirs).
 */
function walkMdx(dir: string, baseDir: string): string[] {
  const out: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith(".") || entry.name.startsWith("_")) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...walkMdx(full, baseDir));
    } else if (entry.name.endsWith(".mdx")) {
      out.push(path.relative(baseDir, full).split(path.sep).join("/"));
    }
  }
  return out;
}

/**
 * Get all entries for a given section (metadata only), including nested folders.
 */
export function getAllEntriesForSection(section: ContentSection): ContentMeta[] {
  const sectionDir = path.join(contentDir, section);

  if (!fs.existsSync(sectionDir)) {
    return [];
  }

  const entries: ContentMeta[] = [];

  for (const rel of walkMdx(sectionDir, sectionDir)) {
    const filePath = path.join(sectionDir, rel);
    const raw = fs.readFileSync(filePath, "utf8");
    const { data } = matter(raw);

    const slug = rel.replace(/\.mdx$/, "");

    entries.push({
      slug,
      title: (data.title as string) || slug,
      date: data.date as string | undefined,
      summary: data.summary as string | undefined,
    });
  }

  // Sort by date descending
  return entries.sort((a, b) => {
    if (a.date && b.date) {
      return a.date > b.date ? -1 : 1;
    }
    return 0;
  });
}

/**
 * Get all notebook entries (metadata only)
 */
export function getAllNotebookEntries(): ContentMeta[] {
  return getAllEntriesForSection("notebook");
}

/**
 * Get all art entries (metadata only)
 */
export function getAllArtEntries(): ContentMeta[] {
  return getAllEntriesForSection("art");
}

/**
 * Get all writing entries (metadata only)
 */
export function getAllWritingEntries(): ContentMeta[] {
  return getAllEntriesForSection("writing");
}

/**
 * Get all systems entries (metadata only)
 */
export function getAllSystemsEntries(): ContentMeta[] {
  return getAllEntriesForSection("systems");
}

/**
 * Get a single entry by slug for a given section
 */
export function getEntryBySlug(
  section: ContentSection,
  slugParts: string[]
): ContentEntry | null {
  const slug = slugParts.join("/");
  const sectionDir = path.join(contentDir, section);
  const filePath = path.join(sectionDir, `${slug}.mdx`);

  if (!fs.existsSync(filePath)) {
    return null;
  }

  const raw = fs.readFileSync(filePath, "utf8");
  const { content, data } = matter(raw);

  return {
    slug,
    content,
    frontMatter: data,
  };
}

/**
 * Legacy function for notebook - kept for backwards compatibility
 */
export function getNotebookBySlug(slugParts: string[]): ContentEntry | null {
  return getEntryBySlug("notebook", slugParts);
}
