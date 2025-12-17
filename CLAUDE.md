# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- **Development server**: `npm run dev` - Starts Next.js development server on http://localhost:3000
- **Build**: `npm run build` - Creates optimized production build
- **Production server**: `npm start` - Serves production build locally
- **Linting**: `npm run lint` - Runs ESLint with Next.js config

## Architecture Overview

This is a Next.js 16 personal portfolio site using the App Router with React Server Components. The architecture centers around dynamic content discovery from MDX files organized in content sections.

### Content System
- **Content sections**: `notebook/`, `art/`, `writing/`, `systems/`, `poetry/`
- **MDX content**: Stored in `content/{section}/` as `.mdx` files with frontmatter
- **Poetry content**: Custom PXML format (`.pxml`) with XML-based poetry markup
- **Dynamic routing**: Uses Next.js catch-all routes `[...slug]` for content pages
- **Content discovery**: Server-side filesystem scanning with metadata caching

### Key Libraries & Patterns
- **next-mdx-remote**: Server-side MDX rendering with custom component overrides
- **gray-matter**: Frontmatter parsing for MDX metadata
- **Custom PXML parser**: XML-based poetry format using xml2js
- **Mermaid integration**: Custom component for diagram rendering in MDX
- **Next.js Image**: Optimized image handling with remote pattern support

### File Organization
```
app/{section}/              # Next.js App Router pages
  [...slug]/page.tsx        # Dynamic content pages
  page.tsx                  # Section index pages
lib/
  mdx.ts                   # Content discovery & parsing utilities
  pxml.ts                  # Poetry XML parsing
components/
  Mdx.tsx                  # MDX rendering with custom components
  Poetry.tsx               # PXML poetry rendering
  Mermaid.tsx              # Mermaid diagram component
content/                   # Content files organized by section
```

### Content Processing Flow
1. **Build time**: Content metadata extracted via `getAllEntriesForSection()`
2. **Request time**: Individual content fetched via `getEntryBySlug()`
3. **Rendering**: MDX processed server-side with custom components
4. **Sorting**: Content sorted by date (newest first) when available

### TypeScript Configuration
- Strict mode enabled with path mapping (`@/*` → `./`)
- Next.js plugin for App Router type safety
- Custom types for content metadata and PXML poetry structure

### Styling Approach
- CSS Custom Properties for design system
- Dark theme with neutral color palette
- Responsive design with mobile-first approach
- Component-level styling classes in MDX renderer