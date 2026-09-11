"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import type { CyclePhase } from "@/lib/cycle";
import { PHASES } from "@/lib/cycle";

export function PhaseBar({ phase }: { phase: CyclePhase }) {
  const router = useRouter();
  const [pending, start] = useTransition();

  function setPhase(next: CyclePhase) {
    start(async () => {
      await fetch("/api/graphql", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          query: "mutation C($phase: CyclePhase!) { startCycle(phase: $phase, actor: \"human-vault\") { phase } }",
          variables: { phase: next },
        }),
      });
      router.refresh();
    });
  }

  return (
    <div className="phases" role="list">
      {PHASES.map((item) => (
        <button
          key={item}
          className="chip"
          data-on={item === phase ? "true" : "false"}
          disabled={pending}
          onClick={() => setPhase(item)}
        >
          {item.toLowerCase()}
        </button>
      ))}
    </div>
  );
}
