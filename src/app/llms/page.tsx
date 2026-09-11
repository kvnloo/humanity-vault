import Link from "next/link";
import { gql } from "@/lib/gql";
import type { Note } from "@/lib/cycle";

export const dynamic = "force-dynamic";

export default async function LlmsPage() {
  const data = await gql<{ llmFrontier: Note[] }>(
    `query { llmFrontier { id title distilled weight type } }`,
  );
  return (
    <main>
      <p className="kicker">LLM frontier · 2026 invariants</p>
      <h2 className="claim">Learn the invariants. Model names are examples.</h2>
      <p className="lede">
        Post-training in the harness. Tool shape. Specialist routing. Note-ledger vs conversation memory. Context triad.
        Retrieve these, not the press release.
      </p>
      <div className="stack">
        {data.llmFrontier.map((n) => (
          <Link key={n.id} href={`/note/${n.id}`} className="card">
            <h3>{n.title}</h3>
            <p>{n.distilled}</p>
            <div className="meta">
              <span>{n.type}</span>
              <span>encode → retrieve</span>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
