export type NoteType = "literature" | "permanent" | "harness" | "moc" | "inbox" | "note";
export type NoteStatus = "draft" | "active" | "pruned" | "archived";
export type ActorKind = "human" | "agent";
export type CyclePhase =
  | "MOVE"
  | "ALERT"
  | "ENCODE"
  | "RETRIEVE"
  | "INTERLEAVE"
  | "REST"
  | "SLEEP"
  | "MEASURE"
  | "PRUNE";
export type ClusterId = "LEARNING_ACCELERATION" | "LLM_FRONTIER" | "HARNESS_RADAR";

export type Note = {
  id: string;
  path?: string;
  title: string;
  type: NoteType;
  status: NoteStatus;
  body?: string;
  distilled?: string;
  tags: string[];
  domains: string[];
  created?: string | null;
  updated?: string | null;
  weight: number;
  lastFired?: string | null;
  retrievalDue: boolean;
};

export type Synapse = {
  src: string;
  dst: string;
  rel: string;
  weight: number;
  fires: number;
  lastFired?: string | null;
};

export type ProtocolStep = {
  id: string;
  source: string;
  title: string;
  why: string;
  durationMinutes?: number | null;
};

export type LearningCycle = {
  phase: CyclePhase;
  ultradianMinutes: number;
  nextRestInMinutes?: number | null;
  protocol: ProtocolStep[];
};

export const PROTOCOL: ProtocolStep[] = [
  {
    id: "move",
    source: "patrick",
    title: "Move",
    why: "BDNF and metabolic state are prerequisites, not extras.",
    durationMinutes: 12,
  },
  {
    id: "alert",
    source: "huberman",
    title: "Alert",
    why: "Plasticity needs a tagged, focused bout — not background tabs.",
    durationMinutes: 3,
  },
  {
    id: "encode",
    source: "sung",
    title: "Encode",
    why: "Group, compare, distill. Do not highlight the vault.",
    durationMinutes: 25,
  },
  {
    id: "retrieve",
    source: "sung",
    title: "Retrieve",
    why: "Regenerate the claim without the page. Familiarity is a trap.",
    durationMinutes: 12,
  },
  {
    id: "rest",
    source: "huberman",
    title: "Rest",
    why: "Consolidation happens after the bout. Gate the next encode.",
    durationMinutes: 10,
  },
  {
    id: "measure",
    source: "johnson",
    title: "Measure",
    why: "Hit-rate, synapse weight, idle-days. Effort is not a biomarker.",
    durationMinutes: 4,
  },
  {
    id: "prune",
    source: "johnson",
    title: "Prune",
    why: "Unused edges are noise. Review candidates; never silent-delete.",
    durationMinutes: 6,
  },
];

export const PHASES: CyclePhase[] = [
  "MOVE",
  "ALERT",
  "ENCODE",
  "RETRIEVE",
  "INTERLEAVE",
  "REST",
  "SLEEP",
  "MEASURE",
  "PRUNE",
];

export const WEIGHT_CAP = 8;
export const HALF_LIFE_DAYS = 14;
export const RETRIEVAL_INTERVALS = [1, 3, 7, 14, 30];

export function hebbianStrengthen(weight: number, amount = 0.18, cap = WEIGHT_CAP): number {
  return Math.min(cap, weight + amount * (1 - weight / cap));
}

export function decayWeight(weight: number, daysIdle: number, halfLife = HALF_LIFE_DAYS): number {
  if (daysIdle <= 0 || weight <= 0) return Math.max(0, weight);
  return weight * 0.5 ** (daysIdle / halfLife);
}

export function retrievalDue(lastFired: string | null | undefined, fires: number, now = Date.now()): boolean {
  if (!lastFired) return true;
  const idx = Math.min(Math.max(fires, 0), RETRIEVAL_INTERVALS.length - 1);
  const idleDays = (now - Date.parse(lastFired)) / 86400000;
  return idleDays >= RETRIEVAL_INTERVALS[idx];
}

export function shouldPrune(note: Pick<Note, "type" | "status" | "weight">, fires: number, idleDays: number): boolean {
  if (note.status === "pruned" || note.status === "archived") return false;
  if (note.type === "moc") return false;
  if (note.type === "permanent" && (fires >= 3 || note.weight >= 0.5)) return false;
  const limit = note.type === "inbox" ? 7 : 21;
  return idleDays >= limit && note.weight < 0.08 && fires < 2;
}
