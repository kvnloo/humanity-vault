"use client";

import type { Note, Synapse } from "@/lib/cycle";

export function BrainMap({ nodes, edges }: { nodes: Note[]; edges: Synapse[] }) {
  const placed = nodes.slice(0, 48);
  const pts = placed.map((n, i) => {
    const angle = (i / Math.max(placed.length, 1)) * Math.PI * 2;
    const r = 28 + (n.weight % 3) * 8 + (i % 5) * 3;
    return { id: n.id, x: 50 + Math.cos(angle) * r, y: 50 + Math.sin(angle) * r * 0.72, n };
  });
  const byId = Object.fromEntries(pts.map((p) => [p.id, p]));
  return (
    <div className="brain" aria-label="Synapse map">
      <svg viewBox="0 0 100 100" role="img">
        {edges.slice(0, 160).map((e, i) => {
          const a = byId[e.src];
          const b = byId[e.dst];
          if (!a || !b) return null;
          return (
            <line
              key={`${e.src}-${e.dst}-${i}`}
              x1={a.x}
              y1={a.y}
              x2={b.x}
              y2={b.y}
              stroke={e.weight < 0.2 ? "#e07a7a" : "#e4b84a"}
              strokeOpacity={Math.min(0.7, 0.12 + e.weight / 10)}
              strokeWidth={Math.max(0.15, Math.min(1.1, e.weight / 4))}
            />
          );
        })}
        {pts.map((p) => (
          <a key={p.id} href={`/note/${p.id}`}>
            <circle cx={p.x} cy={p.y} r={Math.max(0.8, Math.min(2.4, 0.7 + p.n.weight / 4))} fill={p.n.type === "permanent" ? "#9ad7c2" : "#efe6d2"} />
          </a>
        ))}
      </svg>
    </div>
  );
}
