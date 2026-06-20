// components/Poetry.tsx - PXML v2 renderer (ported from emit_html.py).
//
// A collection page is an index (masthead + table of contents); each poem has
// its own page so large sets (e.g. 255-poem DharmaMist) don't render on one
// page. Poems render as discrete islands: vermilion § header, mono dateline,
// stanzas as spaced breaths, role="turn" lines in rose, section breaks as a
// hairline, and inline images via next/image. Text is rendered verbatim.
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { getImageSize, type Collection, type Poem, type Line } from "@/lib/pxml";

function VerseLine({ line }: { line: Line }) {
  const className = line.indent ? "pxml-line pxml-line-sp" : "pxml-line";
  // spatial offset: preserve column indentation precisely (concrete poetry)
  const style = line.indent ? { paddingLeft: `${line.indent}ch` } : undefined;

  return (
    <span className={className} style={style}>
      {line.role === "turn" ? (
        <span className="pxml-turn">{line.text}</span>
      ) : (
        line.text
      )}
    </span>
  );
}

function Masthead({ collection }: { collection: Collection }) {
  return (
    <header className="pxml-masthead">
      <h1 className="pxml-collection-title">{collection.name}</h1>
      {(collection.date || collection.uri) && (
        <div className="pxml-meta">
          {collection.date}
          {collection.date && collection.uri ? " · " : ""}
          {collection.uri && <span className="pxml-uri">{collection.uri}</span>}
        </div>
      )}
      {collection.abstract && (
        <p className="pxml-abstract">{collection.abstract}</p>
      )}
      {collection.keywords.length > 0 && (
        <div className="pxml-keywords">{collection.keywords.join(" · ")}</div>
      )}
    </header>
  );
}

function PoemView({ poem, slug }: { poem: Poem; slug: string }) {
  const hasDateline = Boolean(poem.seq || poem.date || poem.time);

  return (
    <article
      className="pxml-poem"
      id={poem.id || undefined}
      data-form={poem.form || undefined}
    >
      <h2 className="pxml-poem-title">{poem.name}</h2>

      {hasDateline && (
        <div className="pxml-dateline">
          {poem.seq && <span className="pxml-seq">{poem.seq}</span>}
          {poem.date ? (
            <time dateTime={poem.date}>
              {poem.time ? `${poem.date} · ${poem.time}` : poem.date}
            </time>
          ) : poem.time ? (
            <time>{poem.time}</time>
          ) : null}
        </div>
      )}

      {poem.body.map((node, i) => {
        if (node.kind === "stanza") {
          return (
            <div className="pxml-stanza" key={i}>
              {node.lines.map((line, j) => (
                <VerseLine key={j} line={line} />
              ))}
            </div>
          );
        }
        if (node.kind === "image") {
          const dims = getImageSize(slug, node.src);
          return (
            <Image
              key={i}
              className="pxml-image"
              src={`/poetry/${slug}/${node.src}`}
              alt={node.alt ?? ""}
              {...(dims
                ? { width: dims.width, height: dims.height }
                : { width: 0, height: 0, sizes: "100vw" })}
              style={{ width: "100%", height: "auto" }}
            />
          );
        }
        return <hr className="pxml-break" key={i} />;
      })}
    </article>
  );
}

/** Collection page: masthead + a compact table of contents (one link per poem). */
export function CollectionIndex({
  collection,
  slug,
}: {
  collection: Collection;
  slug: string;
}) {
  return (
    <div className="pxml">
      <Masthead collection={collection} />
      <ol className="pxml-toc">
        {collection.poems.map((poem) => (
          <li key={poem.id} className="pxml-toc-item">
            <Link href={`/poetry/${slug}/${poem.id}`} className="pxml-toc-link">
              {poem.seq && <span className="pxml-seq">{poem.seq}</span>}
              <span className="pxml-toc-title">{poem.name}</span>
              {poem.date && <span className="pxml-toc-date">{poem.date}</span>}
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}

/** Single-poem page: breadcrumb back to the collection, the poem, prev/next. */
export function PoemPage({
  collection,
  slug,
  index,
}: {
  collection: Collection;
  slug: string;
  index: number;
}) {
  const poem = collection.poems[index];
  const prev = collection.poems[index - 1];
  const next = collection.poems[index + 1];

  return (
    <div className="pxml">
      <div className="pxml-breadcrumb">
        <Link href={`/poetry/${slug}`} className="pxml-uri">
          ← {collection.name}
        </Link>
      </div>

      <PoemView poem={poem} slug={slug} />

      <nav className="pxml-poemnav">
        {prev ? (
          <Link href={`/poetry/${slug}/${prev.id}`}>← {prev.name}</Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link href={`/poetry/${slug}/${next.id}`}>{next.name} →</Link>
        ) : (
          <span />
        )}
      </nav>
    </div>
  );
}
