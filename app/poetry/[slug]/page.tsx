import { notFound } from "next/navigation";
import { getPoetryBySlug } from "@/lib/pxml";
import { Poetry } from "@/components/Poetry";

type PoetryPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function PoetryEntry({ params }: PoetryPageProps) {
  const resolvedParams = await params;
  const poetry = await getPoetryBySlug(resolvedParams.slug);
  
  if (!poetry) {
    notFound();
  }

  return (
    <main className="card">
      <Poetry poetry={poetry} />
    </main>
  );
}

