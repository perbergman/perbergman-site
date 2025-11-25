import Link from "next/link";
import { getAllSystemsEntries } from "@/lib/mdx";

export default function SystemsPage() {
  const entries = getAllSystemsEntries();

  return (
    <main>
      <section className="card">
        <h2>Systems & Architecture</h2>
        <p className="lede">
          Deep dives into architectures: distributed systems, blockchain topologies,
          event-driven workflows, and agentic AI patterns.
        </p>
      </section>

      {entries.length === 0 ? (
        <section className="card">
          <p className="small">No systems entries yet. Add MDX files to content/systems/</p>
        </section>
      ) : (
        <section className="card">
          <ul className="list">
            {entries.map((entry) => (
              <li key={entry.slug} className="list-item">
                <Link href={`/systems/${entry.slug}`}>
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
