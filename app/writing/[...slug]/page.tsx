import { notFound } from "next/navigation";
import { getEntryBySlug } from "@/lib/mdx";
import { Mdx } from "@/components/Mdx";

type WritingPageProps = {
  params: Promise<{
    slug?: string[];
  }>;
};

export default async function WritingEntry({ params }: WritingPageProps) {
  const resolvedParams = await params;
  const slugArray = resolvedParams.slug || [];

  const entry = await getEntryBySlug("writing", slugArray);
  if (!entry) {
    notFound();
  }

  return (
    <main className="card">
      <Mdx source={entry.content} />
    </main>
  );
}

