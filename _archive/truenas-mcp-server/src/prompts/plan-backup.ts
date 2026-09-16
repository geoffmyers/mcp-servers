import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export function registerPlanBackupPrompt(server: McpServer): void {
  server.registerPrompt(
    "plan-backup",
    {
      title: "Plan Backup Strategy",
      description: "Design a backup strategy for a ZFS dataset",
      argsSchema: {
        datasetPath: z.string().describe("Full path of the ZFS dataset (e.g., tank/data)"),
      },
    },
    (args) => ({
      messages: [
        {
          role: "user" as const,
          content: {
            type: "text" as const,
            text: `Please help me design a backup strategy for the ZFS dataset "${args.datasetPath}" on my TrueNAS system.

Use the available TrueNAS tools to:
1. Get the dataset details including size, used space, and current snapshot configuration
2. List existing snapshots for this dataset
3. Check existing snapshot tasks and replication tasks

Then provide a backup plan that includes:
- Recommended snapshot schedule (frequency and retention policy)
- Whether ZFS replication to a remote target would be beneficial
- Estimated storage overhead for the proposed snapshot retention
- Any cloud backup recommendations if appropriate
- Step-by-step instructions to implement the plan using TrueNAS`,
          },
        },
      ],
    })
  );
}
