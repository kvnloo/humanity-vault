"use client";

import { useState, useTransition } from "react";
import { mutatePrune } from "@/lib/client-mutate";

export function PruneButton({ id }: { id: string }) {
  const [pending, start] = useTransition();
  const [done, setDone] = useState(false);
  return (
    <button
      className="btn danger"
      disabled={pending || done}
      onClick={() =>
        start(async () => {
          await mutatePrune(id);
          setDone(true);
        })
      }
    >
      {done ? "Pruned" : "Prune"}
    </button>
  );
}
