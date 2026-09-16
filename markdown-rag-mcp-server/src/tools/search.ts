import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { formatErrorForMcp } from "@geoffmyers/mcp-server-shared";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { embed } from "../lib/embed.js";
import {
  buildPathFilter,
  getPointById,
  listDistinctPaths,
  matchesPath,
  rrfMerge,
  searchKeyword,
  searchVector,
  type SearchHit,
} from "../lib/qdrant.js";

function formatHit(hit: SearchHit, includeBody: boolean): string {
  const p = hit.payload;
  const head = p.heading_path?.length ? p.heading_path.join(" › ") : p.heading ?? "(no heading)";
  const tags = p.tags?.length ? ` [${p.tags.join(", ")}]` : "";
  const lines = `L${p.start_line}-${p.end_line}`;
  const header = `${p.path}:${lines} — ${head}${tags} (score=${hit.score.toFixed(3)}, id=${hit.id})`;
  if (!includeBody) return header;
  return `${header}\n${p.text.trim()}`;
}

export function registerSearchTools(server: McpServer): void {
  server.tool(
    "semantic_search",
    "Semantic (vector) search over the markdown knowledge base. Best for fuzzy / conceptual queries ('how did I solve the Z-Wave thing').",
    {
      query: z.string().describe("Natural-language search query"),
      limit: z.number().int().positive().max(50).optional().default(10).describe("Max results (default 10, max 50)"),
      path_prefix: z.string().optional().describe("Restrict to paths containing this substring, matched exactly (e.g., 'infrastructure/bmw-mqtt-bridge')"),
      tags: z.array(z.string()).optional().describe("Restrict to chunks whose frontmatter tags include all of these"),
      include_body: z.boolean().optional().default(true).describe("Include chunk text in response (default true)"),
    },
    async (args): Promise<CallToolResult> => {
      try {
        const vector = await embed(args.query);
        const filter = buildPathFilter(args.path_prefix, args.tags);
        // Over-fetch, then apply the exact substring scope: the Qdrant filter
        // is a token match and lets sibling subtrees through.
        const raw = await searchVector(vector, args.path_prefix ? args.limit * 5 : args.limit, filter);
        const hits = raw.filter((h) => matchesPath(h.payload.path, args.path_prefix)).slice(0, args.limit);
        if (hits.length === 0) {
          return { content: [{ type: "text", text: "No matches found." }] };
        }
        const text = hits.map((h) => formatHit(h, args.include_body)).join("\n\n---\n\n");
        return { content: [{ type: "text", text }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    },
  );

  server.tool(
    "hybrid_search",
    "Hybrid search: combines vector (semantic) and keyword (BM25-style) matches via Reciprocal Rank Fusion. Best when query contains exact identifiers (error codes, command names, package versions) alongside conceptual terms.",
    {
      query: z.string().describe("Search query (mixed conceptual + exact-match terms)"),
      limit: z.number().int().positive().max(50).optional().default(10).describe("Max results (default 10, max 50)"),
      path_prefix: z.string().optional().describe("Restrict to paths containing this substring, matched exactly"),
      tags: z.array(z.string()).optional().describe("Restrict to chunks whose frontmatter tags include all of these"),
      include_body: z.boolean().optional().default(true).describe("Include chunk text in response (default true)"),
    },
    async (args): Promise<CallToolResult> => {
      try {
        const filter = buildPathFilter(args.path_prefix, args.tags);
        const vector = await embed(args.query);
        const over = args.path_prefix ? 5 : 2;
        const [vec, kw] = await Promise.all([
          searchVector(vector, Math.max(args.limit * over, 20), filter),
          searchKeyword(args.query, Math.max(args.limit * over, 20), filter),
        ]);
        const merged = rrfMerge(
          [vec.filter((h) => matchesPath(h.payload.path, args.path_prefix)),
           kw.filter((h) => matchesPath(h.payload.path, args.path_prefix))],
          60,
          args.limit,
        );
        if (merged.length === 0) {
          return { content: [{ type: "text", text: "No matches found." }] };
        }
        const text = merged.map((h) => formatHit(h, args.include_body)).join("\n\n---\n\n");
        return { content: [{ type: "text", text }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    },
  );

  server.tool(
    "get_chunk_by_id",
    "Fetch a single chunk by its Qdrant point ID. Use after a search to get the full chunk if include_body was false, or to retrieve neighbors.",
    {
      id: z.union([z.string(), z.number()]).describe("Qdrant point ID returned by a search tool"),
    },
    async (args): Promise<CallToolResult> => {
      try {
        const hit = await getPointById(args.id);
        if (!hit) {
          return { content: [{ type: "text", text: `No chunk with id ${args.id}` }] };
        }
        return { content: [{ type: "text", text: formatHit({ ...hit, score: 0 }, true) }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    },
  );

  server.tool(
    "list_indexed_paths",
    "List distinct file paths present in the index. Useful for verifying coverage or scoping a path_prefix filter. Says whether the scan was exhaustive, so a truncated answer is never mistaken for the whole index.",
    {
      limit: z.number().int().positive().max(2000).optional().default(500).describe("Max paths to return (default 500)"),
      path_prefix: z.string().optional().describe("Restrict to paths CONTAINING this substring (true substring, unlike the tokenised match the search tools use)"),
    },
    async (args): Promise<CallToolResult> => {
      try {
        const { paths, exhaustive, scanned } = await listDistinctPaths(args.limit, args.path_prefix);
        const scope = args.path_prefix ? ` matching ${JSON.stringify(args.path_prefix)}` : "";
        if (paths.length === 0) {
          return {
            content: [{
              type: "text",
              text: `No indexed paths${scope} (scanned ${scanned} points, ` +
                `${exhaustive ? "the whole collection" : "a partial scan"}).`,
            }],
          };
        }
        const note = exhaustive
          ? `${paths.length} path(s)${scope}, from a complete scan of ${scanned} points:`
          : `${paths.length} path(s)${scope} — TRUNCATED at the limit after ${scanned} points; ` +
            `raise limit or narrow path_prefix for a complete answer:`;
        return { content: [{ type: "text", text: `${note}\n${paths.join("\n")}` }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    },
  );
}
