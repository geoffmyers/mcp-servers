import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export function registerRegexHelpPrompt(server: McpServer): void {
  server.prompt(
    "regex-help",
    "Help construct grep regex patterns to search file contents",
    {
      description: z.string().describe("Describe what text patterns you're looking for"),
    },
    (args) => ({
      messages: [
        {
          role: "user" as const,
          content: {
            type: "text" as const,
            text: `Help me build a grep regex pattern for this: "${args.description}"

Use the available grep tools to:
1. Determine the best pattern and flags (case-insensitive, word match, fixed string, etc.)
2. Run the search using grep_search to find matching lines
3. If only file names are needed, use grep_files_matching instead
4. Use grep_count to get match statistics

Provide the results and explain the regex pattern used.`,
          },
        },
      ],
    })
  );
}
