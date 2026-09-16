import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export function registerDiagnosePoolPrompt(server: McpServer): void {
  server.prompt(
    "diagnose-pool",
    "Diagnose the health and status of a specific ZFS pool",
    { pool_name: z.string().describe("Name of the ZFS pool to diagnose") },
    async (args) => ({
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `Diagnose the health of ZFS pool "${args.pool_name}" on this TrueNAS SCALE system. Follow these steps:

1. Use pool_status with name "${args.pool_name}" to get detailed pool information
2. Check the pool's status (ONLINE, DEGRADED, FAULTED, OFFLINE)
3. Review disk topology and any errored/faulted vdevs
4. Use list_alerts to check for pool-related alerts
5. Use list_datasets to check dataset usage within this pool
6. Use list_snapshots to verify snapshot coverage

Provide:
- Pool health status and any issues found
- Disk/vdev status breakdown
- Capacity usage and trends
- Any active alerts related to this pool
- Recommended actions if issues are detected`,
          },
        },
      ],
    })
  );
}
