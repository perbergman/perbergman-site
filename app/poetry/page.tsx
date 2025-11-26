import Link from "next/link";
import { getAllPoetry } from "@/lib/pxml";

export default function PoetryPage() {
  const poems = getAllPoetry();

  return (
    <main>
      <section className="card">
        <h2>Poetry</h2>
        <p className="lede">
          Verses in PXML format — a custom poetry markup language.
        </p>
      </section>

      {poems.length === 0 ? (
        <section className="card">
          <p className="small">No poetry yet. Add PXML files to content/poetry/</p>
        </section>
      ) : (
        <section className="card">
          <ul className="list">
            {poems.map((poem) => (
              <li key={poem.slug} className="list-item">
                <Link href={`/poetry/${poem.slug}`}>
                  <div className="list-title">{poem.title}</div>
                  <div className="list-meta small">{poem.uri}</div>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}

