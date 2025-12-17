import { notFound } from "next/navigation";
import { getEntryBySlug } from "@/lib/mdx";
import { Mdx } from "@/components/Mdx";

type SystemsPageProps = {
  params: Promise<{
    slug?: string[];
  }>;
};

export default async function SystemsEntry({ params }: SystemsPageProps) {
  const resolvedParams = await params;
  const slugArray = resolvedParams.slug || [];

  const entry = await getEntryBySlug("systems", slugArray);
  if (!entry) {
    notFound();
  }

  return (
    <main className="card">
      <Mdx source={entry.content} />
    </main>
  );
}

