// components/Mdx.tsx
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import React from "react";
import Image from "next/image";
import { Mermaid } from "./Mermaid";

const components = {
  // You can customize how elements render here if you like
  h1: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h1 className="text-3xl font-semibold mt-6 mb-4" {...props} />
  ),
  h2: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h2 className="text-2xl font-semibold mt-5 mb-3" {...props} />
  ),
  p: (props: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p className="leading-relaxed my-3" {...props} />
  ),
  ul: (props: React.HTMLAttributes<HTMLUListElement>) => (
    <ul className="list-disc list-inside my-3 space-y-1" {...props} />
  ),
  pre: (props: React.HTMLAttributes<HTMLPreElement>) => {
    // Check if this is a code block with a language
    const codeElement = props.children as any;

    if (codeElement?.props?.className) {
      const match = /language-(\w+)/.exec(codeElement.props.className);
      const language = match ? match[1] : null;

      // Handle Mermaid diagrams
      if (language === "mermaid") {
        const code = String(codeElement.props.children).replace(/\n$/, "");
        return <Mermaid chart={code} />;
      }
    }

    // Regular code block
    return (
      <pre className="bg-neutral-900/70 rounded-lg p-4 overflow-x-auto my-4">
        {props.children}
      </pre>
    );
  },
  code: (props: React.HTMLAttributes<HTMLElement>) => (
    <code className="font-mono text-sm px-1.5 py-0.5 rounded bg-neutral-900/70" {...props} />
  ),
  // Optimized images using Next.js Image component
  img: (props: React.ImgHTMLAttributes<HTMLImageElement>) => (
    <Image
      src={props.src || ""}
      alt={props.alt || ""}
      width={800}
      height={600}
      className="rounded-lg my-4"
      style={{ width: "100%", height: "auto" }}
    />
  ),
};

const mdxOptions = {
  mdxOptions: {
    remarkPlugins: [remarkGfm],
    rehypePlugins: [
      rehypeSlug,
      [rehypeAutolinkHeadings, { behavior: "wrap" }],
    ],
  },
} as any;

export function Mdx({ source }: { source: string }) {
  return <MDXRemote source={source} components={components} options={mdxOptions} />;
}

