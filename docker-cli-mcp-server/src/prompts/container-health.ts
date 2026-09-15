import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export function registerContainerHealthPrompt(server: McpServer): void {
  server.prompt(
    "container-health",
    "Diagnose the health of a Docker container",
    { container: z.string().describe("Container name or ID to diagnose") },
    async (args) => ({
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `Diagnose the health of Docker container "${args.container}". Follow these steps:

1. Use inspect_container to check the container's state, health status, and restart count
2. Use container_logs with tail=50 to check recent logs for errors or warnings
3. Check if the container has been restarting (look at RestartCount in inspect output)
4. Summarize findings: Is the container healthy? Any errors? Restart loops?
5. If unhealthy, suggest remediation steps`,
          },
        },
      ],
    })
  );
}
