import { notFound } from "next/navigation";
import { getEntryBySlug } from "@/lib/mdx";
import { Mdx } from "@/components/Mdx";

type WritingPageProps = {
  params: {
    slug?: string[];
  };
};

export default async function WritingEntry({ params }: WritingPageProps) {
  const slugArray = params.slug || [];

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

