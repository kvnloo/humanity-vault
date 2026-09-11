"use client";

import { useState, useTransition } from "react";
import { mutateRetrieve } from "@/lib/client-mutate";

export function RetrievalActions({ id }: { id: string }) {
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);

  function mark(recalled: boolean) {
    start(async () => {
      await mutateRetrieve(id, recalled);
      setMsg(recalled ? "Potentiated." : "Miss logged. Weight downscaled.");
    });
  }

  return (
    <div>
      <div className="actions">
        <button className="btn" disabled={pending} onClick={() => mark(true)}>
          Recalled
        </button>
        <button className="btn ghost" disabled={pending} onClick={() => mark(false)}>
          Missed
        </button>
      </div>
      {msg ? <p className="lede">{msg}</p> : null}
    </div>
  );
}
