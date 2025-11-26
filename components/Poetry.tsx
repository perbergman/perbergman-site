// components/Poetry.tsx - Component for rendering PXML poetry
import React from "react";
import type { PoetryDocument } from "@/lib/pxml";

export function Poetry({ poetry }: { poetry: PoetryDocument }) {
  return (
    <div className="poetry-document">
      {/* Header with metadata */}
      {poetry.about.text && (
        <h2 className="poetry-about">{poetry.about.text}</h2>
      )}
      
      {poetry.keywords && (
        <h3 className="poetry-keywords">{poetry.keywords}</h3>
      )}

      {poetry.about.text || poetry.keywords ? <hr className="poetry-divider" /> : null}

      {/* Table of contents */}
      {poetry.poems.length > 1 && (
        <>
          <div className="poetry-toc">
            {poetry.poems.map((poem) => (
              <div key={poem.localref} className="poetry-toc-item">
                <span className="poetry-toc-number">{poem.localref}</span>
                <span className="poetry-toc-dots">.......... </span>
                <a href={`#poem-${poem.localref}`} className="poetry-toc-link">
                  {poem.name}
                </a>
              </div>
            ))}
          </div>
          <hr className="poetry-divider" />
        </>
      )}

      {/* Poems */}
      <div className="poetry-poems">
        {poetry.poems.map((poem) => (
          <div key={poem.localref} id={`poem-${poem.localref}`} className="poem">
            <h4 className="poem-title">{poem.name}</h4>
            <blockquote className="poem-content">
              <pre className="poem-text">{poem.content}</pre>
            </blockquote>
          </div>
        ))}
      </div>
    </div>
  );
}

