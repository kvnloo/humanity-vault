import snapshot from "../../content/snapshot.json";
import {
  decayWeight,
  hebbianStrengthen,
  retrievalDue,
  shouldPrune,
  type ClusterId,
  type CyclePhase,
  type Note,
  type NoteStatus,
  type NoteType,
  type Synapse,
} from "./cycle";

type SnapNote = {
  id: string;
  path: string;
  title: string;
  type: string;
  status: string;
  body: string;
  distilled: string;
  tags: string[];
  domains: string[];
  created?: string | null;
  updated?: string | null;
  weight: number;
  lastFired?: string | null;
  retrievalDue: boolean;
};

type SnapEdge = {
  src: string;
  dst: string;
  rel: string;
  weight: number;
  fires: number;
  lastFired?: string | null;
};

type Snapshot = {
  version: number;
  clusters: Record<string, string[]>;
  notes: SnapNote[];
  edges: SnapEdge[];
};

const data = snapshot as Snapshot;

type LiveNote = Note & { body: string; fires: number };
type LiveEdge = LiveEdgeState;
type LiveEdgeState = Synapse & { fires: number };

const notes = new Map<string, LiveNote>();
const edges: LiveEdge[] = [];
let currentPhase: CyclePhase = "ENCODE";

function coerceType(value: string): NoteType {
  const allowed: NoteType[] = ["literature", "permanent", "harness", "moc", "inbox", "note"];
  return (allowed as string[]).includes(value) ? (value as NoteType) : "note";
}

function coerceStatus(value: string): NoteStatus {
  const allowed: NoteStatus[] = ["draft", "active", "pruned", "archived"];
  return (allowed as string[]).includes(value) ? (value as NoteStatus) : "draft";
}

for (const n of data.notes) {
  notes.set(n.id, {
    id: n.id,
    path: n.path,
    title: n.title,
    type: coerceType(n.type),
    status: coerceStatus(n.status),
    body: n.body,
    distilled: n.distilled,
    tags: n.tags ?? [],
    domains: n.domains ?? [],
    created: n.created,
    updated: n.updated,
    weight: n.weight ?? 1,
    lastFired: n.lastFired,
    retrievalDue: true,
    fires: 0,
  });
}

for (const e of data.edges) {
  if (!notes.has(e.src)) continue;
  edges.push({
    src: e.src,
    dst: e.dst,
    rel: e.rel,
    weight: e.weight ?? 1,
    fires: e.fires ?? 0,
    lastFired: e.lastFired,
  });
}

function recompute(note: LiveNote): LiveNote {
  const related = edges.filter((e) => e.src === note.id || e.dst === note.id);
  const weight =
    related.length === 0 ? note.weight : related.reduce((s, e) => s + e.weight, 0) / related.length;
  const fires = related.reduce((s, e) => s + e.fires, 0);
  const lastFired = related.reduce<string | null>((best, e) => {
    if (!e.lastFired) return best;
    if (!best) return e.lastFired;
    return Date.parse(e.lastFired) > Date.parse(best) ? e.lastFired : best;
  }, null);
  note.weight = weight;
  note.fires = fires;
  note.lastFired = lastFired;
  note.retrievalDue = retrievalDue(lastFired, fires);
  return note;
}

export function publicNote(note: LiveNote): Note {
  const n = recompute(note);
  return {
    id: n.id,
    path: n.path,
    title: n.title,
    type: n.type,
    status: n.status,
    body: n.body,
    distilled: n.distilled,
    tags: n.tags,
    domains: n.domains,
    created: n.created,
    updated: n.updated,
    weight: n.weight,
    lastFired: n.lastFired,
    retrievalDue: n.retrievalDue,
  };
}

export function getNote(id: string): Note | null {
  const n = notes.get(id);
  return n ? publicNote(n) : null;
}

export function allNotes(): Note[] {
  return [...notes.values()].filter((n) => n.status !== "pruned").map(publicNote);
}

export function searchNotes(q: string, limit = 20): Note[] {
  const needle = q.toLowerCase();
  return allNotes()
    .filter((n) => `${n.title} ${n.distilled ?? ""} ${n.body ?? ""}`.toLowerCase().includes(needle))
    .slice(0, limit);
}

export function clusterNotes(id: ClusterId): Note[] {
  if (id === "HARNESS_RADAR") {
    return allNotes().filter((n) => n.type === "harness");
  }
  const ids = data.clusters[id] ?? [];
  return ids.map((nid) => getNote(nid)).filter((n): n is Note => Boolean(n));
}

export function synapsesFor(id: string, limit = 12): Synapse[] {
  return edges
    .filter((e) => e.src === id || e.dst === id)
    .sort((a, b) => b.weight - a.weight)
    .slice(0, limit);
}

export function fire(id: string): Note | null {
  const note = notes.get(id);
  if (!note) return null;
  const now = new Date().toISOString();
  for (const e of edges) {
    if (e.src === id || e.dst === id) {
      e.weight = hebbianStrengthen(e.weight);
      e.fires += 1;
      e.lastFired = now;
    }
  }
  note.lastFired = now;
  note.fires += 1;
  return publicNote(note);
}

export function retrieve(id: string, recalled: boolean): Note | null {
  const note = fire(id);
  if (!note) return null;
  if (!recalled) {
    for (const e of edges) {
      if (e.src === id || e.dst === id) e.weight *= 0.92;
    }
  }
  return getNote(id);
}

export function prune(id: string): Note | null {
  const note = notes.get(id);
  if (!note) return null;
  note.status = "pruned";
  return publicNote(note);
}

export function strengthen(src: string, dst: string): Synapse | null {
  if (src === dst) return null;
  const existing = edges.find((e) => e.src === src && e.dst === dst && e.rel === "coactivation");
  const now = new Date().toISOString();
  if (existing) {
    existing.weight = hebbianStrengthen(existing.weight, 0.22);
    existing.fires += 1;
    existing.lastFired = now;
    return existing;
  }
  const created: LiveEdge = {
    src,
    dst,
    rel: "coactivation",
    weight: 1.15,
    fires: 1,
    lastFired: now,
  };
  edges.push(created);
  return created;
}

export function dueRetrievals(limit = 8): Note[] {
  return allNotes()
    .filter((n) => n.type === "permanent" && n.retrievalDue)
    .slice(0, limit);
}

export function pruneCandidates(limit = 20): Note[] {
  const now = Date.now();
  const out: Note[] = [];
  for (const n of notes.values()) {
    const idle = n.lastFired ? (now - Date.parse(n.lastFired)) / 86400000 : 999;
    if (shouldPrune(n, n.fires, idle)) out.push(publicNote(n));
    if (out.length >= limit) break;
  }
  return out;
}

export function decayIdle(): number {
  const now = Date.now();
  let n = 0;
  for (const e of edges) {
    const last = e.lastFired ? Date.parse(e.lastFired) : now;
    const idle = (now - last) / 86400000;
    const next = decayWeight(e.weight, idle);
    if (Math.abs(next - e.weight) > 1e-9) {
      e.weight = next;
      n += 1;
    }
  }
  return n;
}

export function brain() {
  const live = allNotes();
  const mean = edges.length ? edges.reduce((s, e) => s + e.weight, 0) / edges.length : 0;
  return {
    neurons: live.length,
    synapses: edges.length,
    meanWeight: mean,
    pruneCandidates: [...notes.values()].filter((n) => n.status === "pruned").length,
    lastLoopAt: new Date().toISOString(),
    nodes: live.slice(0, 80),
    edges: edges.slice(0, 400),
  };
}

export function getCycle(): { phase: CyclePhase; ultradianMinutes: number; nextRestInMinutes: number } {
  return {
    phase: currentPhase,
    ultradianMinutes: 90,
    nextRestInMinutes: ["ENCODE", "RETRIEVE", "INTERLEAVE"].includes(currentPhase) ? 20 : 0,
  };
}

export function startCycle(phase: CyclePhase) {
  currentPhase = phase;
  return getCycle();
}
