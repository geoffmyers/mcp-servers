import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export function registerSearchHelpPrompt(server: McpServer): void {
  server.prompt(
    "search-knowledge-base",
    "Search the markdown knowledge base for a topic",
    {
      question: z.string().describe("What you're trying to find or remember"),
    },
    (args) => ({
      messages: [
        {
          role: "user" as const,
          content: {
            type: "text" as const,
            text: `Search the markdown knowledge base for: "${args.question}"

Strategy:
1. If the query contains exact identifiers (error codes, file paths, command names, version strings), prefer hybrid_search.
2. For conceptual / fuzzy queries, use semantic_search.
3. If you suspect the answer lives under a specific subtree (e.g., infrastructure/bmw-mqtt-bridge, docs/security), pass that as path_prefix.
4. Start with limit=10 and include_body=true. Increase limit if the top hits look adjacent but miss.
5. Cite the file path + line range from the result header when answering.
6. If results look stale or empty, check the markdown-rag://stats resource — it might mean the indexer hasn't run since the relevant content was added.`,
          },
        },
      ],
    }),
  );
}
