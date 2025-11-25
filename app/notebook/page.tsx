import Link from "next/link";
import { getAllNotebookEntries } from "@/lib/mdx";

export default function NotebookPage() {
  const entries = getAllNotebookEntries();

  return (
    <main>
      <section className="card">
        <h2>Notebook</h2>
        <p className="lede">
          A living collection of notes, experiments, and explorations across systems architecture,
          AI, blockchain, and the intersections between technology and practice.
        </p>
      </section>

      {entries.length === 0 ? (
        <section className="card">
          <p className="small">No notebook entries yet. Add MDX files to content/notebook/</p>
        </section>
      ) : (
        <section className="card">
          <ul className="list">
            {entries.map((entry) => (
              <li key={entry.slug} className="list-item">
                <Link href={`/notebook/${entry.slug}`}>
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

