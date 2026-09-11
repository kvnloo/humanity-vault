import Link from "next/link";
import { notFound } from "next/navigation";
import { RetrievalActions } from "@/components/RetrievalActions";
import { allNotes } from "@/lib/brain";
import { gql } from "@/lib/gql";
import type { Note, Synapse } from "@/lib/cycle";

export function generateStaticParams() {
  return allNotes().map((n) => ({ id: n.id }));
}

export default async function NotePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await gql<{ note: (Note & { synapses: Synapse[] }) | null }>(
    `query N($id: ID!) { note(id: $id) { id title distilled body type status weight retrievalDue synapses { src dst rel weight } } }`,
    { id },
  );
  if (!data.note) notFound();
  const note = data.note;
  return (
    <main>
      <p className="kicker">
        {note.type} · {note.status}
      </p>
      <h2 className="claim">{note.title}</h2>
      <p className="lede">{note.distilled}</p>
      <RetrievalActions id={note.id} />
      <article className="prose note-body">{note.body}</article>
      {note.synapses.length ? (
        <>
          <p className="kicker" style={{ marginTop: "1.4rem" }}>
            Synapses
          </p>
          <div className="stack">
            {note.synapses.map((s) => {
              const other = s.src === note.id ? s.dst : s.src;
              return (
                <Link key={`${s.src}-${s.dst}-${s.rel}`} href={`/note/${other}`} className="card">
                  <h3>{other}</h3>
                  <p>
                    {s.rel} · weight {s.weight.toFixed(2)}
                  </p>
                </Link>
              );
            })}
          </div>
        </>
      ) : null}
    </main>
  );
}
