import Link from "next/link";
import { PhaseBar } from "@/components/PhaseBar";
import { Ultradian } from "@/components/Ultradian";
import { gql, HOME_QUERY } from "@/lib/gql";
import type { CyclePhase, Note, ProtocolStep } from "@/lib/cycle";

type HomeData = {
  cycle: { phase: CyclePhase; ultradianMinutes: number; nextRestInMinutes: number; protocol: ProtocolStep[] };
  cluster: { title: string; notes: Note[] };
  llmFrontier: Note[];
  dueRetrievals: Note[];
  brain: { neurons: number; synapses: number; meanWeight: number; pruneCandidates: number };
};

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const data = await gql<HomeData>(HOME_QUERY);
  const encodeNotes = data.cluster.notes.filter((n) => n.type === "permanent").slice(0, 3);
  return (
    <main>
      <p className="kicker">{data.cycle.phase.toLowerCase()} · sung · huberman · johnson · patrick</p>
      <h2 className="claim">Learn the frontier like a brain, not a feed.</h2>
      <p className="lede">
        Encode a schema, retrieve it, rest, then prune noise. Agents write. Humans adjudicate. This is humanity&rsquo;s
        open vault.
      </p>

      <section className="cycle">
        <Ultradian phase={data.cycle.phase} />
        <div>
          <p className="kicker">90-minute bout</p>
          <p className="lede" style={{ margin: 0 }}>
            Rest in {data.cycle.nextRestInMinutes ?? 0} min. Plasticity needs alertness, then consolidation.
          </p>
          <PhaseBar phase={data.cycle.phase} />
        </div>
      </section>

      <div className="metrics">
        <div className="metric">
          <b>{data.brain.neurons}</b>
          <span>neurons</span>
        </div>
        <div className="metric">
          <b>{data.brain.synapses}</b>
          <span>synapses</span>
        </div>
        <div className="metric">
          <b>{data.brain.meanWeight.toFixed(2)}</b>
          <span>mean weight</span>
        </div>
      </div>

      <p className="kicker">Encode next</p>
      <div className="stack">
        {encodeNotes.map((n) => (
          <Link key={n.id} href={`/note/${n.id}`} className="card">
            <h3>{n.title}</h3>
            <p>{n.distilled}</p>
            <div className="meta">
              <span>weight {n.weight.toFixed(2)}</span>
              <span>encode</span>
            </div>
          </Link>
        ))}
      </div>

      <p className="kicker" style={{ marginTop: "1.4rem" }}>
        LLM invariants due
      </p>
      <div className="stack">
        {data.llmFrontier.slice(0, 4).map((n) => (
          <Link key={n.id} href={`/note/${n.id}`} className="card">
            <h3>{n.title}</h3>
            <p>{n.distilled}</p>
          </Link>
        ))}
      </div>

      <p className="lede" style={{ marginTop: "1.4rem" }}>
        <Link href="/llms">LLM teaching track →</Link> · <Link href="/prune">Prune noise →</Link>
      </p>
    </main>
  );
}
