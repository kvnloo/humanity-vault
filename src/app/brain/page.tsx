import { BrainMap } from "@/components/BrainMap";
import { gql } from "@/lib/gql";
import type { Note, Synapse } from "@/lib/cycle";

export default async function BrainPage() {
  const data = await gql<{
    brain: {
      neurons: number;
      synapses: number;
      meanWeight: number;
      pruneCandidates: number;
      nodes: Note[];
      edges: Synapse[];
    };
  }>(`query { brain { neurons synapses meanWeight pruneCandidates nodes { id title type weight } edges { src dst rel weight fires } } }`);
  return (
    <main>
      <p className="kicker">Living graph</p>
      <h2 className="claim">What fires together, wires. What doesn&rsquo;t, decays.</h2>
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
          <b>{data.brain.pruneCandidates}</b>
          <span>pruned</span>
        </div>
      </div>
      <BrainMap nodes={data.brain.nodes} edges={data.brain.edges} />
      <p className="lede">Gold edges are strong. Rose edges are dying. Nightly loop downscales idle weight.</p>
    </main>
  );
}
