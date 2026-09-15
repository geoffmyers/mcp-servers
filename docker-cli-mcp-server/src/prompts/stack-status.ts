import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export function registerStackStatusPrompt(server: McpServer): void {
  server.prompt(
    "stack-status",
    "Check the status of a Docker Compose stack",
    { project_dir: z.string().describe("Absolute path to the Compose project directory") },
    async (args) => ({
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `Check the status of the Docker Compose stack at "${args.project_dir}". Follow these steps:

1. Use compose_status to see the current state of all services
2. For any services that are not running or unhealthy, use container_logs to check their logs
3. Summarize: Which services are running? Which are down or unhealthy?
4. If any services have issues, suggest remediation steps`,
          },
        },
      ],
    })
  );
}
