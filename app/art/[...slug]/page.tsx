import { notFound } from "next/navigation";
import { getEntryBySlug } from "@/lib/mdx";
import { MDXRemote } from "next-mdx-remote/rsc";

type ArtPageProps = {
  params: {
    slug?: string[];
  };
};

export default async function ArtEntry({ params }: ArtPageProps) {
  const slugArray = params.slug || [];

  const entry = await getEntryBySlug("art", slugArray);
  if (!entry) {
    notFound();
  }

  return (
    <main className="card">
      <MDXRemote source={entry.content} />
    </main>
  );
}

