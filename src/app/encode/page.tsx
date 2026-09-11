import Link from "next/link";
import { gql } from "@/lib/gql";
import type { Note } from "@/lib/cycle";

export const dynamic = "force-dynamic";

export default async function EncodePage() {
  const data = await gql<{ cluster: { notes: Note[] } }>(
    `query { cluster(id: LEARNING_ACCELERATION) { notes { id title distilled type weight } } }`,
  );
  return (
    <main>
      <p className="kicker">Sung · higher-order encoding</p>
      <h2 className="claim">Do not reread. Build the schema.</h2>
      <p className="lede">
        Group these claims. Compare them. Name the relationship. Only then open the body. Exposure without encoding is
        noise.
      </p>
      <div className="stack">
        {data.cluster.notes.map((n) => (
          <Link key={n.id} href={`/note/${n.id}`} className="card">
            <h3>{n.title}</h3>
            <p>{n.distilled}</p>
            <div className="meta">
              <span>{n.type}</span>
              <span>w {n.weight.toFixed(2)}</span>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
