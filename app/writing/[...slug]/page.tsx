import { notFound } from "next/navigation";
import { getEntryBySlug } from "@/lib/mdx";
import { MDXRemote } from "next-mdx-remote/rsc";

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
      <MDXRemote source={entry.content} />
    </main>
  );
}

