"use client";

import { fire, prune, retrieve, startCycle } from "@/lib/brain";
import type { CyclePhase } from "@/lib/cycle";

const prefix = process.env.NEXT_PUBLIC_BASE_PATH || "";

async function gqlMut(query: string, variables: Record<string, unknown>) {
  const res = await fetch(`${prefix}/api/graphql`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ query, variables }),
  });
  if (!res.ok) throw new Error(`http ${res.status}`);
  const payload = (await res.json()) as { errors?: { message: string }[] };
  if (payload.errors?.length) throw new Error(payload.errors[0]?.message || "graphql");
}

export async function mutateRetrieve(id: string, recalled: boolean) {
  try {
    await gqlMut(
      "mutation R($id: ID!, $recalled: Boolean!) { retrieve(noteId: $id, recalled: $recalled, actor: \"human-vault\") { id } }",
      { id, recalled },
    );
  } catch {
    retrieve(id, recalled);
  }
}

export async function mutateFire(id: string) {
  try {
    await gqlMut(
      "mutation F($id: ID!) { fire(noteId: $id, actor: \"human-vault\", kind: human) { id } }",
      { id },
    );
  } catch {
    fire(id);
  }
}

export async function mutatePrune(id: string) {
  try {
    await gqlMut("mutation P($id: ID!) { prune(noteId: $id, actor: \"human-vault\") { id } }", { id });
  } catch {
    prune(id);
  }
}

export async function mutateCycle(phase: CyclePhase) {
  try {
    await gqlMut("mutation C($phase: CyclePhase!) { startCycle(phase: $phase, actor: \"human-vault\") { phase } }", {
      phase,
    });
  } catch {
    startCycle(phase);
  }
}
