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
 * Get all entries for a given section (metadata only)
 */
export function getAllEntriesForSection(section: ContentSection): ContentMeta[] {
  const sectionDir = path.join(contentDir, section);

  if (!fs.existsSync(sectionDir)) {
    return [];
  }

  const files = fs.readdirSync(sectionDir);
  const entries: ContentMeta[] = [];

  for (const file of files) {
    if (!file.endsWith(".mdx")) continue;

    const filePath = path.join(sectionDir, file);
    const raw = fs.readFileSync(filePath, "utf8");
    const { data } = matter(raw);

    const slug = file.replace(/\.mdx$/, "");

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
