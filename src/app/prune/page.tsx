import Link from "next/link";
import { PruneButton } from "@/components/PruneButton";
import { gql } from "@/lib/gql";
import type { Note } from "@/lib/cycle";

export const dynamic = "force-dynamic";

export default async function PrunePage() {
  const data = await gql<{ pruneCandidates: Note[] }>(
    `query { pruneCandidates(limit: 20) { id title distilled type weight status } }`,
  );
  return (
    <main>
      <p className="kicker">Homeostasis · never silent-delete</p>
      <h2 className="claim">Prune noise. Keep the signal.</h2>
      <p className="lede">
        Unused inbox notes and weak edges are candidates. Permanent claims with fires stay. Restore is always allowed.
      </p>
      {data.pruneCandidates.length === 0 ? (
        <p className="lede">No prune candidates in this snapshot. Fire notes by retrieving them; idle edges will decay.</p>
      ) : (
        <div className="stack">
          {data.pruneCandidates.map((n) => (
            <article key={n.id} className="card">
              <Link href={`/note/${n.id}`}>
                <h3>{n.title}</h3>
              </Link>
              <p>{n.distilled}</p>
              <div className="meta">
                <span>
                  {n.type} · w {n.weight.toFixed(2)}
                </span>
                <PruneButton id={n.id} />
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
