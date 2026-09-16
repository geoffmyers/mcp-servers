import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export function registerSedHelpPrompt(server: McpServer): void {
  server.prompt(
    "sed-help",
    "Help construct sed commands for text substitution and extraction",
    {
      description: z.string().describe("Describe the text transformation you want to perform"),
    },
    (args) => ({
      messages: [
        {
          role: "user" as const,
          content: {
            type: "text" as const,
            text: `Help me build a sed command for this task: "${args.description}"

Use the available sed tools to:
1. First use sed_preview to test the substitution pattern without modifying the file
2. If the preview looks correct, use sed_replace with confirm=true to apply the change
3. Use sed_extract if you only need to print specific lines or pattern matches

Provide the results and explain the sed expression used.`,
          },
        },
      ],
    })
  );
}
