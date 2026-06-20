import { notFound } from "next/navigation";
import { getCollectionBySlug } from "@/lib/pxml";
import { CollectionIndex } from "@/components/Poetry";

type CollectionPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function CollectionPage({ params }: CollectionPageProps) {
  const { slug } = await params;
  const collection = getCollectionBySlug(slug);

  if (!collection) {
    notFound();
  }

  return (
    <main className="card">
      <CollectionIndex collection={collection} slug={slug} />
    </main>
  );
}
