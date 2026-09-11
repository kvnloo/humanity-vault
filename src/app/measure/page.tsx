import Link from "next/link";
import { gql } from "@/lib/gql";
import type { Note, ProtocolStep } from "@/lib/cycle";

export const dynamic = "force-dynamic";

export default async function MeasurePage() {
  const data = await gql<{
    brain: { neurons: number; synapses: number; meanWeight: number; pruneCandidates: number };
    dueRetrievals: Note[];
    cycle: { protocol: ProtocolStep[] };
  }>(
    `query {
      brain { neurons synapses meanWeight pruneCandidates }
      dueRetrievals(limit: 4) { id title }
      cycle { protocol { id source title why durationMinutes } }
    }`,
  );
  return (
    <main>
      <p className="kicker">Johnson · measure the loop</p>
      <h2 className="claim">Effort is not a biomarker.</h2>
      <p className="lede">
        Hit-rate, synapse weight, idle-days, prune rate, cycle adherence. Time-on-page is vanity. Sleep still wins.
      </p>
      <div className="metrics">
        <div className="metric">
          <b>{data.brain.neurons}</b>
          <span>neurons</span>
        </div>
        <div className="metric">
          <b>{data.brain.meanWeight.toFixed(2)}</b>
          <span>mean w</span>
        </div>
        <div className="metric">
          <b>{data.dueRetrievals.length}</b>
          <span>due</span>
        </div>
      </div>
      <div className="stack">
        {data.cycle.protocol.map((step) => (
          <article key={step.id} className="card">
            <h3>
              {step.title} · {step.source}
            </h3>
            <p>{step.why}</p>
            <div className="meta">
              <span>{step.durationMinutes} min</span>
              <span>protocol</span>
            </div>
          </article>
        ))}
      </div>
      <p className="lede" style={{ marginTop: "1.2rem" }}>
        <Link href="/prune">Review prune candidates →</Link>
      </p>
    </main>
  );
}
