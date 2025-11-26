import { notFound } from "next/navigation";
import { getEntryBySlug } from "@/lib/mdx";
import { Mdx } from "@/components/Mdx";

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
      <Mdx source={entry.content} />
    </main>
  );
}

