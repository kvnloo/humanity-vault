import Link from "next/link";
import { RetrievalActions } from "@/components/RetrievalActions";
import { gql } from "@/lib/gql";
import type { Note } from "@/lib/cycle";

export default async function RetrievePage() {
  const data = await gql<{ dueRetrievals: Note[] }>(
    `query { dueRetrievals(limit: 8) { id title distilled weight retrievalDue } }`,
  );
  return (
    <main>
      <p className="kicker">Retrieve · expanding interval</p>
      <h2 className="claim">Regenerate the claim. Then look.</h2>
      <p className="lede">
        Cover the distilled sentence. Say it. Mark recalled or missed. Hits potentiate; misses downscale. Familiarity
        is not knowledge.
      </p>
      <div className="stack">
        {data.dueRetrievals.map((n) => (
          <article key={n.id} className="card">
            <Link href={`/note/${n.id}`}>
              <h3>{n.title}</h3>
            </Link>
            <p>{n.distilled}</p>
            <RetrievalActions id={n.id} />
          </article>
        ))}
      </div>
    </main>
  );
}
