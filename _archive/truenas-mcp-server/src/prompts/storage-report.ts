import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export function registerStorageReportPrompt(server: McpServer): void {
  server.registerPrompt(
    "storage-report",
    {
      title: "Storage Report",
      description: "Generate a comprehensive storage usage report",
    },
    () => ({
      messages: [
        {
          role: "user" as const,
          content: {
            type: "text" as const,
            text: `Please generate a comprehensive storage usage report for my TrueNAS system.

Use the available TrueNAS tools to:
1. List all pools and their health status
2. List all datasets with their space usage
3. Check for any storage-related alerts

Provide a report that includes:
- Total raw storage capacity across all pools
- Usable capacity after redundancy overhead
- Current utilization per pool and top-level datasets
- Datasets consuming the most space
- Growth trends if snapshot data is available
- Any pools approaching capacity thresholds (>80% usage)
- Recommendations for storage optimization or expansion`,
          },
        },
      ],
    })
  );
}
