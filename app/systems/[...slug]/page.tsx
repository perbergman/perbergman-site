import { notFound } from "next/navigation";
import { getEntryBySlug } from "@/lib/mdx";
import { Mdx } from "@/components/Mdx";

type SystemsPageProps = {
  params: {
    slug?: string[];
  };
};

export default async function SystemsEntry({ params }: SystemsPageProps) {
  const slugArray = params.slug || [];

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

