import { graphql, type ExecutionResult } from "graphql";
import { schema } from "./schema";

const UPSTREAM = process.env.GRAPHQL_URL;

export async function gql<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
  if (UPSTREAM) {
    const res = await fetch(UPSTREAM, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ query, variables }),
      cache: "no-store",
    });
    const payload = (await res.json()) as ExecutionResult<T>;
    if (payload.errors?.length) throw new Error(payload.errors.map((e) => e.message).join("; "));
    return JSON.parse(JSON.stringify(payload.data)) as T;
  }
  const result = await graphql({ schema, source: query, variableValues: variables });
  if (result.errors?.length) throw new Error(result.errors.map((e) => e.message).join("; "));
  return JSON.parse(JSON.stringify(result.data)) as T;
}

export const HOME_QUERY = /* GraphQL */ `
  query Home {
    cycle { phase ultradianMinutes nextRestInMinutes protocol { id source title why durationMinutes } }
    cluster(id: LEARNING_ACCELERATION) { title notes { id title distilled weight retrievalDue type } }
    llmFrontier { id title distilled weight }
    dueRetrievals(limit: 6) { id title distilled weight }
    brain { neurons synapses meanWeight pruneCandidates }
  }
`;
