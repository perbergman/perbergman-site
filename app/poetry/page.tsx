import Link from "next/link";
import { getAllCollections } from "@/lib/pxml";

export default function PoetryPage() {
  const collections = getAllCollections();

  return (
    <main>
      <section className="card">
        <h2>Poetry</h2>
        <p className="lede">
          Verses in PXML v2 — a structured poetry format with stanzas, caesura,
          and per-poem dates.
        </p>
      </section>

      {collections.length === 0 ? (
        <section className="card">
          <p className="small">
            No poetry yet. Add PXML files to content/poetry/
          </p>
        </section>
      ) : (
        <section className="card">
          <ul className="list">
            {collections.map((collection) => (
              <li key={collection.slug} className="list-item">
                <Link href={`/poetry/${collection.slug}`}>
                  <div className="list-title">{collection.name}</div>
                  <div className="list-meta small">
                    {collection.date ? `${collection.date} · ` : ""}
                    {collection.poemCount}{" "}
                    {collection.poemCount === 1 ? "poem" : "poems"}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
