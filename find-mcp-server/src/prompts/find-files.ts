import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export function registerFindFilesPrompt(server: McpServer): void {
  server.prompt(
    "find-files",
    "Help construct find queries to locate files and directories",
    {
      description: z.string().describe("Describe what files you're looking for"),
    },
    (args) => ({
      messages: [
        {
          role: "user" as const,
          content: {
            type: "text" as const,
            text: `Help me find files matching this description: "${args.description}"

Use the available find tools to:
1. Determine the best search criteria (name pattern, type, size, modification time)
2. Run the search using find_files
3. If needed, use find_by_content to search within file contents

Provide the results and explain the search criteria used.`,
          },
        },
      ],
    })
  );
}
