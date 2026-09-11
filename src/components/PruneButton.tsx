"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

export function PruneButton({ id }: { id: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <button
      className="btn danger"
      disabled={pending}
      onClick={() =>
        start(async () => {
          await fetch("/api/graphql", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
              query: "mutation P($id: ID!) { prune(noteId: $id, actor: \"human-vault\") { id status } }",
              variables: { id },
            }),
          });
          router.refresh();
        })
      }
    >
      Prune
    </button>
  );
}
