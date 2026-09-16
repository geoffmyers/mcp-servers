import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export function registerDiagnoseAddonPrompt(server: McpServer): void {
  server.prompt(
    "diagnose-addon",
    "Diagnose issues with a Home Assistant add-on",
    { slug: z.string().describe("Add-on slug identifier (e.g. 'core_mosquitto', 'a0d7b954_nodered')") },
    async (args) => ({
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `Diagnose the Home Assistant add-on "${args.slug}". Follow these steps:

1. Use addon_info with slug "${args.slug}" to check the add-on's state, version, and configuration
2. Use addon_logs with slug "${args.slug}" to check recent logs for errors or warnings
3. Check if the add-on is running, stopped, or in an error state
4. Check if there is an update available for the add-on
5. Summarize findings:
   - Is the add-on running and healthy?
   - Are there any errors in the logs?
   - Is the add-on up to date?
6. If unhealthy, suggest remediation steps (restart, update, check configuration, etc.)`,
          },
        },
      ],
    })
  );
}
