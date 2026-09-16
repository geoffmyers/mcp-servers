import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export function registerDiagnosePoolPrompt(server: McpServer): void {
  server.registerPrompt(
    "diagnose-pool",
    {
      title: "Diagnose Pool Health",
      description: "Diagnose the health of a ZFS storage pool",
      argsSchema: {
        poolName: z.string().describe("Name of the ZFS pool to diagnose"),
      },
    },
    (args) => ({
      messages: [
        {
          role: "user" as const,
          content: {
            type: "text" as const,
            text: `Please diagnose the health of the ZFS pool "${args.poolName}" on my TrueNAS system.

Use the available TrueNAS tools to:
1. Get the pool status and configuration using the pool resource or get_pool_status tool
2. Check for any active alerts related to this pool
3. Review the disk health (S.M.A.R.T. data) for drives in this pool
4. Check recent scrub results and resilver history

Provide a summary that includes:
- Overall pool health status (ONLINE, DEGRADED, FAULTED, etc.)
- VDEV layout and redundancy level
- Any drives showing errors or warnings
- Space utilization and fragmentation
- Recommendations for any issues found`,
          },
        },
      ],
    })
  );
}
