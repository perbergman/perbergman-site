"use client";

import { useEffect, useRef } from "react";
import mermaid from "mermaid";

let mermaidInitialized = false;

export function Mermaid({ chart }: { chart: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mermaidInitialized) {
      mermaid.initialize({
        startOnLoad: true,
        theme: "dark",
        themeVariables: {
          primaryColor: "#ffc857",
          primaryTextColor: "#e0e0e0",
          primaryBorderColor: "#ffc857",
          lineColor: "#666",
          secondaryColor: "#2a2a2a",
          tertiaryColor: "#1a1a1a",
          background: "#1a1a1a",
          mainBkg: "#2a2a2a",
          secondBkg: "#1a1a1a",
          textColor: "#e0e0e0",
          fontSize: "16px",
        },
      });
      mermaidInitialized = true;
    }

    if (ref.current) {
      const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
      mermaid.render(id, chart).then(({ svg }) => {
        if (ref.current) {
          ref.current.innerHTML = svg;
        }
      });
    }
  }, [chart]);

  return <div ref={ref} className="mermaid-diagram my-6" />;
}

