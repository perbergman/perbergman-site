export default function HomePage() {
  return (
    <main className="main-grid">
      <section>
        <article className="card">
          <h2>Summary</h2>
          <p className="lede">
            Generative Architect with 30+ years building distributed systems across AI, blockchain,
            and cloud. Known for extremely fast generative prototyping (80+ apps in 2025), deep
            architectural clarity, and the ability to synthesize multiple domains into coherent,
            running systems.
          </p>
          <p className="tagline">
            From telecom and OODBMS in Sweden → cloud & blockchain → today&apos;s agentic AI and
            LLM-first workflows.
          </p>
        </article>

        <article className="card">
          <h2>Value Proposition</h2>
          <p className="lede">
            Specialty: turning high-ambiguity technical programs into stable, scalable architectures
            that large organizations can actually run.
          </p>
          <ul className="list">
            <li className="list-item small">
              Owns the full loop: architecture, implementation patterns, and operational reality.
            </li>
            <li className="list-item small">
              Uses AI tools as force multipliers, not crutches — keeping systems legible and
              maintainable.
            </li>
            <li className="list-item small">
              Equally comfortable at whiteboard, in code, or with executives.
            </li>
          </ul>
        </article>

        <article className="card">
          <h2>Core Capabilities</h2>
          <div className="pill-row">
            <span className="pill">Generative AI–assisted prototyping</span>
            <span className="pill">0→1 system creation</span>
            <span className="pill">Distributed architecture</span>
            <span className="pill">Blockchain & smart contracts</span>
            <span className="pill">Cloud-native patterns (Azure, AWS)</span>
            <span className="pill">Workflow & data pipelines</span>
            <span className="pill">High-scale systems</span>
            <span className="pill">Technical strategy & advisory</span>
            <span className="pill">FinTech & carbon markets</span>
            <span className="pill">Identity & cryptography</span>
            <span className="pill">AI developer workflows</span>
          </div>
        </article>
      </section>

      <aside>
        <section className="card">
          <h2>Selected Work</h2>
          <ul className="list">
            <li className="list-item">
              <div className="list-title">Global Funds Disbursement Tracking · EY</div>
              <div className="list-meta">
                Hyperledger Besu · Azure · Agentic AI · multi-institution transparency
              </div>
            </li>
            <li className="list-item">
              <div className="list-title">Carbon Market Traceability · XPANSIV</div>
              <div className="list-meta">
                Environmental commodities · provenance · ledger-backed lifecycle
              </div>
            </li>
            <li className="list-item">
              <div className="list-title">ZKP Private Transactions · EY</div>
              <div className="list-meta">
                Circom/Groth16 · BN254 · UTXO-style state · on-chain verification
              </div>
            </li>
            <li className="list-item">
              <div className="list-title">RAGTime: Neo4j + NVIDIA GPUs</div>
              <div className="list-meta">
                Neo4j graph RAG · GPU-accelerated pipelines · Medium article
              </div>
            </li>
          </ul>
        </section>

        <section className="card">
          <h2>Links</h2>
          <ul className="list">
            <li className="list-item small">
              Resume (PDF):{" "}
              <a href="https://github.com/perbergman/resume/blob/main/resume.pdf" target="_blank" rel="noreferrer">
                github.com/perbergman/resume
              </a>
            </li>
            <li className="list-item small">
              System notebook:{" "}
              <a
                href="https://github.com/perbergman/system-alchemist"
                target="_blank"
                rel="noreferrer"
              >
                system-alchemist
              </a>
            </li>
            <li className="list-item small">
              RAGTime article:{" "}
              <a
                href="https://medium.com/@bergman/ragtime-building-a-rag-with-neo4j-and-nvidia-gpus-on-the-cloud-31e11aa03000"
                target="_blank"
                rel="noreferrer"
              >
                Medium
              </a>
            </li>
          </ul>
        </section>
      </aside>
    </main>
  );
}
