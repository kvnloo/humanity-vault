import { graphql } from "graphql";
import { NextRequest } from "next/server";
import { schema } from "@/lib/schema";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const UPSTREAM = process.env.GRAPHQL_URL;

async function run(query: string, variables: Record<string, unknown> | undefined) {
  if (UPSTREAM) {
    const res = await fetch(UPSTREAM, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ query, variables }),
      cache: "no-store",
    });
    return Response.json(await res.json());
  }
  const result = await graphql({ schema, source: query, variableValues: variables });
  return Response.json(result);
}

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get("query") || "{ __typename }";
  return run(query, undefined);
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as { query?: string; variables?: Record<string, unknown> };
  return run(body.query || "{ __typename }", body.variables);
}
