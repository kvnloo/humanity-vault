import {
  GraphQLBoolean,
  GraphQLEnumType,
  GraphQLID,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
  GraphQLFloat,
} from "graphql";
import {
  allNotes,
  brain,
  clusterNotes,
  dueRetrievals,
  fire,
  getCycle,
  getNote,
  prune,
  pruneCandidates,
  retrieve,
  searchNotes,
  startCycle,
  strengthen,
  synapsesFor,
} from "./brain";
import { PHASES, PROTOCOL, type ClusterId, type CyclePhase } from "./cycle";

const NoteType = new GraphQLEnumType({
  name: "NoteType",
  values: Object.fromEntries(["literature", "permanent", "harness", "moc", "inbox", "note"].map((v) => [v, { value: v }])),
});
const NoteStatus = new GraphQLEnumType({
  name: "NoteStatus",
  values: Object.fromEntries(["draft", "active", "pruned", "archived"].map((v) => [v, { value: v }])),
});
const ActorKind = new GraphQLEnumType({
  name: "ActorKind",
  values: { human: { value: "human" }, agent: { value: "agent" } },
});
const CyclePhaseEnum = new GraphQLEnumType({
  name: "CyclePhase",
  values: Object.fromEntries(PHASES.map((v) => [v, { value: v }])),
});
const ClusterEnum = new GraphQLEnumType({
  name: "ClusterId",
  values: {
    LEARNING_ACCELERATION: { value: "LEARNING_ACCELERATION" },
    LLM_FRONTIER: { value: "LLM_FRONTIER" },
    HARNESS_RADAR: { value: "HARNESS_RADAR" },
  },
});

const SynapseType: GraphQLObjectType = new GraphQLObjectType({
  name: "Synapse",
  fields: {
    src: { type: new GraphQLNonNull(GraphQLID) },
    dst: { type: new GraphQLNonNull(GraphQLID) },
    rel: { type: new GraphQLNonNull(GraphQLString) },
    weight: { type: new GraphQLNonNull(GraphQLFloat) },
    fires: { type: new GraphQLNonNull(GraphQLInt) },
    lastFired: { type: GraphQLString },
  },
});

const NoteObject: GraphQLObjectType = new GraphQLObjectType({
  name: "Note",
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLID) },
    path: { type: GraphQLString },
    title: { type: new GraphQLNonNull(GraphQLString) },
    type: { type: new GraphQLNonNull(NoteType) },
    status: { type: new GraphQLNonNull(NoteStatus) },
    body: { type: GraphQLString },
    distilled: { type: GraphQLString },
    tags: { type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(GraphQLString))) },
    domains: { type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(GraphQLString))) },
    created: { type: GraphQLString },
    updated: { type: GraphQLString },
    weight: { type: new GraphQLNonNull(GraphQLFloat) },
    lastFired: { type: GraphQLString },
    retrievalDue: { type: new GraphQLNonNull(GraphQLBoolean) },
    synapses: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(SynapseType))),
      args: { limit: { type: GraphQLInt, defaultValue: 12 } },
      resolve: (note, args: { limit?: number }) => synapsesFor(note.id, args.limit ?? 12),
    },
  }),
});

const ProtocolType = new GraphQLObjectType({
  name: "ProtocolStep",
  fields: {
    id: { type: new GraphQLNonNull(GraphQLID) },
    source: { type: new GraphQLNonNull(GraphQLString) },
    title: { type: new GraphQLNonNull(GraphQLString) },
    why: { type: new GraphQLNonNull(GraphQLString) },
    durationMinutes: { type: GraphQLInt },
  },
});

const CycleType = new GraphQLObjectType({
  name: "LearningCycle",
  fields: {
    phase: { type: new GraphQLNonNull(CyclePhaseEnum) },
    ultradianMinutes: { type: new GraphQLNonNull(GraphQLInt) },
    nextRestInMinutes: { type: GraphQLInt },
    protocol: { type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(ProtocolType))) },
  },
});

const ClusterType = new GraphQLObjectType({
  name: "Cluster",
  fields: {
    id: { type: new GraphQLNonNull(ClusterEnum) },
    title: { type: new GraphQLNonNull(GraphQLString) },
    notes: { type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(NoteObject))) },
  },
});

const BrainType = new GraphQLObjectType({
  name: "BrainSnapshot",
  fields: {
    neurons: { type: new GraphQLNonNull(GraphQLInt) },
    synapses: { type: new GraphQLNonNull(GraphQLInt) },
    meanWeight: { type: new GraphQLNonNull(GraphQLFloat) },
    pruneCandidates: { type: new GraphQLNonNull(GraphQLInt) },
    lastLoopAt: { type: GraphQLString },
    nodes: { type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(NoteObject))) },
    edges: { type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(SynapseType))) },
  },
});

const titles: Record<ClusterId, string> = {
  LEARNING_ACCELERATION: "Human learning acceleration",
  LLM_FRONTIER: "LLM frontier teaching track",
  HARNESS_RADAR: "Harness radar",
};

export const schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: "Query",
    fields: {
      note: {
        type: NoteObject,
        args: { id: { type: new GraphQLNonNull(GraphQLID) } },
        resolve: (_s, args: { id: string }) => getNote(args.id),
      },
      search: {
        type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(NoteObject))),
        args: { q: { type: new GraphQLNonNull(GraphQLString) }, limit: { type: GraphQLInt, defaultValue: 20 } },
        resolve: (_s, args: { q: string; limit?: number }) => searchNotes(args.q, args.limit ?? 20),
      },
      cluster: {
        type: ClusterType,
        args: { id: { type: new GraphQLNonNull(ClusterEnum) } },
        resolve: (_s, args: { id: ClusterId }) => ({
          id: args.id,
          title: titles[args.id],
          notes: clusterNotes(args.id),
        }),
      },
      brain: {
        type: new GraphQLNonNull(BrainType),
        resolve: () => brain(),
      },
      dueRetrievals: {
        type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(NoteObject))),
        args: { limit: { type: GraphQLInt, defaultValue: 8 } },
        resolve: (_s, args: { limit?: number }) => dueRetrievals(args.limit ?? 8),
      },
      pruneCandidates: {
        type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(NoteObject))),
        args: { limit: { type: GraphQLInt, defaultValue: 20 } },
        resolve: (_s, args: { limit?: number }) => pruneCandidates(args.limit ?? 20),
      },
      cycle: {
        type: new GraphQLNonNull(CycleType),
        resolve: () => ({ ...getCycle(), protocol: PROTOCOL }),
      },
      llmFrontier: {
        type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(NoteObject))),
        resolve: () => clusterNotes("LLM_FRONTIER"),
      },
    },
  }),
  mutation: new GraphQLObjectType({
    name: "Mutation",
    fields: {
      fire: {
        type: NoteObject,
        args: {
          noteId: { type: new GraphQLNonNull(GraphQLID) },
          actor: { type: new GraphQLNonNull(GraphQLString) },
          kind: { type: ActorKind, defaultValue: "human" },
        },
        resolve: (_s, args: { noteId: string }) => fire(args.noteId),
      },
      retrieve: {
        type: NoteObject,
        args: {
          noteId: { type: new GraphQLNonNull(GraphQLID) },
          recalled: { type: new GraphQLNonNull(GraphQLBoolean) },
          actor: { type: new GraphQLNonNull(GraphQLString) },
        },
        resolve: (_s, args: { noteId: string; recalled: boolean }) => retrieve(args.noteId, args.recalled),
      },
      prune: {
        type: NoteObject,
        args: {
          noteId: { type: new GraphQLNonNull(GraphQLID) },
          actor: { type: new GraphQLNonNull(GraphQLString) },
        },
        resolve: (_s, args: { noteId: string }) => prune(args.noteId),
      },
      strengthen: {
        type: SynapseType,
        args: {
          src: { type: new GraphQLNonNull(GraphQLID) },
          dst: { type: new GraphQLNonNull(GraphQLID) },
          actor: { type: new GraphQLNonNull(GraphQLString) },
        },
        resolve: (_s, args: { src: string; dst: string }) => strengthen(args.src, args.dst),
      },
      startCycle: {
        type: new GraphQLNonNull(CycleType),
        args: {
          phase: { type: new GraphQLNonNull(CyclePhaseEnum) },
          actor: { type: GraphQLString },
        },
        resolve: (_s, args: { phase: CyclePhase }) => ({ ...startCycle(args.phase), protocol: PROTOCOL }),
      },
    },
  }),
});

export { allNotes };
