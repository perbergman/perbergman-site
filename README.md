# Per Bergman — Personal Site

A Next.js 14 personal portfolio site with dynamic MDX content sections.

## Content Structure

All content is stored as MDX files in the `content/` directory, organized by section:

```
content/
├── notebook/     # Personal notes, experiments, explorations
├── art/          # Art projects, experiments, photography
├── writing/      # Essays, articles, technical writing
└── systems/      # System architecture deep dives
```

## Adding Content

Simply add `.mdx` files to any content directory. They will automatically appear on the site.

### File Format

Each MDX file should have frontmatter with metadata:

```mdx
---
title: "Your Entry Title"
date: "2025-11-25"
summary: "A brief description of the entry"
---

# Your Entry Title

Your content here...
```

### Frontmatter Fields

- **title** (required): The title of the entry
- **date** (optional): ISO date string (YYYY-MM-DD) - used for sorting
- **summary** (optional): Brief description shown in the list

### File Naming

The filename (without `.mdx`) becomes the URL slug:
- `content/notebook/my-entry.mdx` → `/notebook/my-entry`
- `content/art/project-name.mdx` → `/art/project-name`

## Sections

### Notebook (`/notebook`)
A living collection of notes, experiments, and explorations. Add files to `content/notebook/`.

### Art & Experiments (`/art`)
Art projects, experiments, and photography. Add files to `content/art/`.

### Writing (`/writing`)
Essays, articles, and technical writing. Add files to `content/writing/`.

### Systems & Architecture (`/systems`)
Deep dives into system architectures. Add files to `content/systems/`.

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Tech Stack

- **Next.js 14** - App Router with React Server Components
- **MDX** - Markdown with JSX for rich content
- **next-mdx-remote** - Server-side MDX rendering
- **TypeScript** - Type safety throughout
- **CSS Custom Properties** - Design system with dark theme

## Features

- ✅ Dynamic content discovery - just add MDX files
- ✅ Auto-sorted by date (newest first)
- ✅ Responsive design
- ✅ Dark theme
- ✅ Accessible (keyboard navigation, focus states)
- ✅ Fast (static generation where possible)
- ✅ Type-safe

## Project Structure

```
perbergman-site/
├── app/                    # Next.js app directory
│   ├── art/               # Art section pages
│   ├── notebook/          # Notebook section pages
│   ├── systems/           # Systems section pages
│   ├── writing/           # Writing section pages
│   ├── layout.tsx         # Root layout with navigation
│   ├── page.tsx           # Homepage
│   └── globals.css        # Global styles
├── components/            # React components
│   └── Mdx.tsx           # MDX rendering component
├── content/              # MDX content files
│   ├── art/             # Art entries
│   ├── notebook/        # Notebook entries
│   ├── systems/         # Systems entries
│   └── writing/         # Writing entries
└── lib/                  # Utility functions
    └── mdx.ts           # MDX file handling
```

## License

© 2025 Per Bergman

