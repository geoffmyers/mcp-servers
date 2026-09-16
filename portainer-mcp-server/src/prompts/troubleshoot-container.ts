import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export function registerTroubleshootContainerPrompt(server: McpServer): void {
  server.registerPrompt(
    "troubleshoot-container",
    {
      title: "Troubleshoot Container",
      description: "Diagnose and troubleshoot issues with a Docker container",
      argsSchema: {
        containerId: z.string().describe("ID or name of the container to troubleshoot"),
      },
    },
    (args) => ({
      messages: [
        {
          role: "user" as const,
          content: {
            type: "text" as const,
            text: `Please help me troubleshoot the Docker container "${args.containerId}" in Portainer.

Use the available Portainer tools to:
1. Get the container's current status and configuration
2. Retrieve recent container logs
3. Check the container's resource usage (CPU, memory, network)
4. Inspect the container's network settings and port bindings

Provide a diagnostic report that includes:
- Container state (running, stopped, restarting, etc.)
- Recent log entries highlighting any errors or warnings
- Resource consumption analysis
- Network connectivity status
- Health check results if configured
- Recommendations to resolve any identified issues`,
          },
        },
      ],
    })
  );
}
