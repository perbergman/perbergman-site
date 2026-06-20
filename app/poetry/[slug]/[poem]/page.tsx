import { notFound } from "next/navigation";
import { getCollectionBySlug } from "@/lib/pxml";
import { PoemPage } from "@/components/Poetry";

type PoemPageProps = {
  params: Promise<{
    slug: string;
    poem: string;
  }>;
};

export default async function SinglePoemPage({ params }: PoemPageProps) {
  const { slug, poem } = await params;
  const collection = getCollectionBySlug(slug);

  if (!collection) {
    notFound();
  }

  const index = collection.poems.findIndex((p) => p.id === poem);
  if (index === -1) {
    notFound();
  }

  return (
    <main className="card">
      <PoemPage collection={collection} slug={slug} index={index} />
    </main>
  );
}
