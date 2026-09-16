import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export function registerHealthCheckPrompt(server: McpServer): void {
  server.prompt(
    "health-check",
    "Perform a comprehensive Home Assistant health check",
    {},
    async () => ({
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `Perform a comprehensive Home Assistant health check. Follow these steps:

1. Use core_info to check the Core version, state, and whether an update is available
2. Use supervisor_info to check the Supervisor version and state
3. Use os_info to check the OS version and board info
4. Use host_info to check the host system details
5. Use resolution_info to check for any issues or suggestions in the Resolution Center
6. Use addon_list to get all installed add-ons and check their states
7. Summarize findings:
   - Is Home Assistant Core running and healthy?
   - Are there any pending updates (Core, Supervisor, OS, add-ons)?
   - Are all add-ons running as expected?
   - Are there any issues or suggestions in the Resolution Center?
8. If any issues are found, suggest remediation steps`,
          },
        },
      ],
    })
  );
}
