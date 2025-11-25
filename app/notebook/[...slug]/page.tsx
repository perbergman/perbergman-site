import { notFound } from "next/navigation";
import { getNotebookBySlug } from "@/lib/mdx";
import { MDXRemote } from "next-mdx-remote/rsc";

type NotebookPageProps = {
  params: {
    slug?: string[]; // [...slug] gives you an array of path segments
  };
};

export default async function NotebookEntry({ params }: NotebookPageProps) {
  const slugArray = params.slug || [];

  const entry = await getNotebookBySlug(slugArray);
  if (!entry) {
    notFound();
  }

  return (
    <main className="card">
      <MDXRemote source={entry.content} />
    </main>
  );
}
