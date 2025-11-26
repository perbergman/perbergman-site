// Drafts Action: Convert to MDX format
// This action converts a Draft to MDX format and copies to clipboard
// Then use Drafts' built-in "File" action step to save it
//
// Usage:
// 1. Write your draft
// 2. Add tags: #notebook, #writing, #art, #systems, or #poetry
// 3. Run this action
// 4. MDX content is in clipboard - paste into your repo

// Get the draft content
const content = draft.content;
const tags = draft.tags;

// Determine section from tags
let section = "notebook"; // default
if (tags.includes("writing")) section = "writing";
else if (tags.includes("art")) section = "art";
else if (tags.includes("systems")) section = "systems";
else if (tags.includes("poetry")) section = "poetry";
else if (tags.includes("notebook")) section = "notebook";

// Extract title (first line)
const lines = content.split("\n");
let title = lines[0].replace(/^#\s*/, "").trim();
if (!title) {
  title = "Untitled";
}

// Generate slug from title
const slug = title
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/^-|-$/g, "");

// Get timestamp (ISO format)
const now = new Date();
const timestamp = now.toISOString();
const dateOnly = timestamp.split("T")[0]; // YYYY-MM-DD

// Extract content (everything after first line)
const bodyContent = lines.slice(1).join("\n").trim();

// Filter out section tags for keywords
const sectionTags = ["notebook", "writing", "art", "systems", "poetry"];
const keywords = tags
  .filter(tag => !sectionTags.includes(tag))
  .join(", ");

// Build MDX frontmatter
const mdxContent = `---
title: "${title}"
date: "${dateOnly}"
timestamp: "${timestamp}"
${keywords ? `tags: "${keywords}"` : ""}
---

${bodyContent}
`;

// Set template tags for use in File action step
draft.setTemplateTag("mdx_content", mdxContent);
draft.setTemplateTag("section", section);
draft.setTemplateTag("slug", slug);

// Copy to clipboard as backup
app.setClipboard(mdxContent);

app.displaySuccessMessage(`MDX ready! Section: ${section}, File: ${slug}.mdx`);

