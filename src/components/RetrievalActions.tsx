"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

export function RetrievalActions({ id }: { id: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);

  async function mark(recalled: boolean) {
    start(async () => {
      await fetch("/api/graphql", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          query: "mutation R($id: ID!, $recalled: Boolean!) { retrieve(noteId: $id, recalled: $recalled, actor: \"human-vault\") { id weight } }",
          variables: { id, recalled },
        }),
      });
      setMsg(recalled ? "Potentiated." : "Miss logged. Weight downscaled.");
      router.refresh();
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
