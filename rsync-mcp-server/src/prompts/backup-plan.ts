import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export function registerBackupPlanPrompt(server: McpServer): void {
  server.prompt(
    "backup-plan",
    "Help plan and execute an rsync backup strategy",
    {
      source: z.string().describe("Source directory to back up"),
      destination: z.string().describe("Destination directory or remote path"),
    },
    (args) => ({
      messages: [
        {
          role: "user" as const,
          content: {
            type: "text" as const,
            text: `Help me plan an rsync backup from "${args.source}" to "${args.destination}".

Use the available rsync tools to:
1. First run rsync_dry_run to preview what would be transferred
2. Review the output and suggest any exclude patterns (e.g. node_modules, .git, __pycache__)
3. Once the plan looks good, execute with rsync_execute (with confirm: true)

Consider:
- Whether --delete is appropriate (removes files at destination not in source)
- Whether compression (-z) would help (useful for remote transfers)
- Common exclude patterns for the type of data being backed up`,
          },
        },
      ],
    })
  );
}
