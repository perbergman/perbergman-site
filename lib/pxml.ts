// lib/pxml.ts - PXML parser for poetry files
import fs from "fs";
import path from "path";
import { parseStringPromise } from "xml2js";

const POETRY_DIR = path.join(process.cwd(), "content", "poetry");

export type Poem = {
  name: string;
  localref: string;
  content: string;
};

export type PoetryDocument = {
  about: {
    uri: string;
    text?: string;
  };
  keywords?: string;
  poems: Poem[];
};

export type PoetryMeta = {
  slug: string;
  title: string;
  uri: string;
};

/**
 * Parse a PXML file and return structured data
 */
export async function parsePXML(filePath: string): Promise<PoetryDocument> {
  const xmlContent = fs.readFileSync(filePath, "utf-8");
  const result = await parseStringPromise(xmlContent);

  const poetry = result.poetry;
  const about = poetry.about?.[0] || {};
  const keywords = poetry.keywords?.[0] || "";
  const poemsData = poetry.poems?.[0]?.poem || [];

  const poems: Poem[] = poemsData.map((poem: any) => ({
    name: poem.$.name || "Untitled",
    localref: poem.$.localref || "0",
    content: poem._ || poem || "",
  }));

  return {
    about: {
      uri: about.$.uri || "",
      text: about._ || "",
    },
    keywords: typeof keywords === "string" ? keywords : keywords._ || "",
    poems,
  };
}

/**
 * Get all poetry files metadata
 */
export function getAllPoetry(): PoetryMeta[] {
  if (!fs.existsSync(POETRY_DIR)) {
    return [];
  }

  const files = fs.readdirSync(POETRY_DIR);
  const pxmlFiles = files.filter((f) => f.endsWith(".pxml"));

  return pxmlFiles.map((file) => {
    const slug = file.replace(/\.pxml$/, "");
    const filePath = path.join(POETRY_DIR, file);
    const xmlContent = fs.readFileSync(filePath, "utf-8");
    
    // Quick parse to get title from about/@uri
    const uriMatch = xmlContent.match(/uri="([^"]+)"/);
    const uri = uriMatch ? uriMatch[1] : slug;
    const title = uri.split(":").pop() || slug;

    return {
      slug,
      title,
      uri,
    };
  });
}

/**
 * Get a single poetry document by slug
 */
export async function getPoetryBySlug(slug: string): Promise<PoetryDocument | null> {
  const filePath = path.join(POETRY_DIR, `${slug}.pxml`);
  
  if (!fs.existsSync(filePath)) {
    return null;
  }

  return parsePXML(filePath);
}

