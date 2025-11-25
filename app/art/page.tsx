import Link from "next/link";
import { getAllArtEntries } from "@/lib/mdx";

export default function ArtPage() {
  const entries = getAllArtEntries();

  return (
    <main>
      <section className="card">
        <h2>Art & Experiments</h2>
        <p className="lede">
          Charcoal, digital fresco, glitch experiments, and photography. This isn&apos;t a portfolio
          so much as a process log — where Zen, Dada, and systems thinking leak into marks on paper
          and pixels.
        </p>
      </section>

      {entries.length === 0 ? (
        <section className="card">
          <p className="small">No art entries yet. Add MDX files to content/art/</p>
        </section>
      ) : (
        <section className="card">
          <ul className="list">
            {entries.map((entry) => (
              <li key={entry.slug} className="list-item">
                <Link href={`/art/${entry.slug}`}>
                  <div className="list-title">{entry.title}</div>
                  {entry.summary && <div className="list-meta small">{entry.summary}</div>}
                  {entry.date && (
                    <div className="list-meta small" style={{ marginTop: "4px" }}>
                      {new Date(entry.date).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </div>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
