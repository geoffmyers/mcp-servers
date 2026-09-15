import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export function registerStorageReportPrompt(server: McpServer): void {
  server.prompt(
    "storage-report",
    "Generate a comprehensive storage health report for TrueNAS SCALE",
    {},
    async () => ({
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `Generate a comprehensive storage health report for this TrueNAS SCALE system. Follow these steps:

1. Use system_info to get the system hostname, version, and uptime
2. Use list_pools to get all storage pools and their health status
3. Use list_datasets to review dataset usage and quotas
4. Use list_snapshots to check recent snapshot activity
5. Use list_alerts to check for any storage-related warnings or errors
6. Use list_services to verify storage services (SMB, NFS) are running

Summarize:
- Overall system health
- Pool status (ONLINE/DEGRADED/FAULTED) and capacity usage
- Any alerts requiring attention
- Snapshot coverage (are critical datasets being snapshotted?)
- Service status for storage-related services
- Recommendations for any issues found`,
          },
        },
      ],
    })
  );
}
