import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";
import { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Per Bergman — Generative Architect",
  description:
    "Generative Architect — AI, Cloud, Blockchain, Distributed Systems. Senior Manager, EY.",
  icons: {
    icon: [
      {
        url: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='0.9em' font-size='90'>⚡</text></svg>",
      },
    ],
  },
};

const navLinks = [
  { href: "/", label: "Overview" },
  { href: "/notebook", label: "Notebook" },
  { href: "/systems", label: "Systems & Architecture" },
  { href: "/writing", label: "Writing" },
  { href: "/art", label: "Art & Experiments" },
];

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="layout-root">
          <header className="header">
            <div className="header-topline">
              <div>
                <div className="title">PER BERGMAN</div>
                <div className="subtitle">
                  Generative Architect — AI • Cloud • Blockchain • Distributed Systems
                </div>
              </div>
              <span className="badge">
                Senior Manager, EY · USA ·{" "}
                <a
                  href="https://www.linkedin.com/in/perbergman/"
                  target="_blank"
                  rel="noreferrer"
                >
                  LinkedIn
                </a>
                {" · "}
                <a
                  href="https://github.com/perbergman"
                  target="_blank"
                  rel="noreferrer"
                >
                  GitHub
                </a>
                {" · "}
                <a
                  href="mailto:nondualist@gmail.com"
                >
                  Email
                </a>
              </span>
            </div>
            <div className="chip-row">
              <span className="chip">Agentic AI</span>
              <span className="chip">Blockchain systems</span>
              <span className="chip">Public funds traceability</span>
              <span className="chip">Carbon markets</span>
              <span className="chip">Distributed systems</span>
            </div>
            <nav className="nav">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href}>
                  {link.label}
                </Link>
              ))}
            </nav>
          </header>

          {children}

          <footer className="footer">
            <span>© {new Date().getFullYear()} Per Bergman</span>
            <span className="small">
              Built with Next.js. Code on{" "}
              <a
                href="https://github.com/perbergman"
                target="_blank"
                rel="noreferrer"
              >
                GitHub
              </a>
              .
            </span>
          </footer>
        </div>
      </body>
    </html>
  );
}
