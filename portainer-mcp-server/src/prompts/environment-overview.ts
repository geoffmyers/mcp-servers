import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export function registerEnvironmentOverviewPrompt(server: McpServer): void {
  server.registerPrompt(
    "environment-overview",
    {
      title: "Environment Overview",
      description: "Generate a status report for a Portainer environment",
      argsSchema: {
        environmentId: z.string().describe("ID of the Portainer environment to report on"),
      },
    },
    (args) => ({
      messages: [
        {
          role: "user" as const,
          content: {
            type: "text" as const,
            text: `Please generate a comprehensive status report for Portainer environment ID "${args.environmentId}".

Use the available Portainer tools to:
1. Get the environment details and connection status
2. List all stacks deployed in this environment
3. List all containers and their current states
4. Check Docker system information (images, volumes, networks)

Provide a report that includes:
- Environment name, type, and connectivity status
- Summary of running, stopped, and unhealthy containers
- List of deployed stacks and their status
- Resource utilization overview
- Any containers in a restart loop or error state
- Unused images or volumes that could be cleaned up
- Recommendations for improving the environment's health`,
          },
        },
      ],
    })
  );
}
