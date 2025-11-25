import Link from "next/link";
import { getAllWritingEntries } from "@/lib/mdx";

export default function WritingPage() {
  const entries = getAllWritingEntries();

  return (
    <main>
      <section className="card">
        <h2>Writing</h2>
        <p className="lede">
          Essays, notes, and fragments on engineering practice, generative tooling, architecture,
          and whatever else is currently live in the stack.
        </p>
      </section>

      {entries.length === 0 ? (
        <section className="card">
          <p className="small">No writing entries yet. Add MDX files to content/writing/</p>
        </section>
      ) : (
        <section className="card">
          <ul className="list">
            {entries.map((entry) => (
              <li key={entry.slug} className="list-item">
                <Link href={`/writing/${entry.slug}`}>
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
