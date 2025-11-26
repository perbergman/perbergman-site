import { notFound } from "next/navigation";
import { getPoetryBySlug } from "@/lib/pxml";
import { Poetry } from "@/components/Poetry";

type PoetryPageProps = {
  params: {
    slug: string;
  };
};

export default async function PoetryEntry({ params }: PoetryPageProps) {
  const poetry = await getPoetryBySlug(params.slug);
  
  if (!poetry) {
    notFound();
  }

  return (
    <main className="card">
      <Poetry poetry={poetry} />
    </main>
  );
}

