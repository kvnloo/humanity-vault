"use client";

import { useState, useTransition } from "react";
import type { CyclePhase } from "@/lib/cycle";
import { PHASES } from "@/lib/cycle";
import { mutateCycle } from "@/lib/client-mutate";

export function PhaseBar({ phase }: { phase: CyclePhase }) {
  const [current, setPhase] = useState(phase);
  const [pending, start] = useTransition();

  function pick(next: CyclePhase) {
    start(async () => {
      await mutateCycle(next);
      setPhase(next);
    });
  }

  return (
    <div className="phases" role="list">
      {PHASES.map((item) => (
        <button
          key={item}
          className="chip"
          data-on={item === current ? "true" : "false"}
          disabled={pending}
          onClick={() => pick(item)}
        >
          {item.toLowerCase()}
        </button>
      ))}
    </div>
  );
}
