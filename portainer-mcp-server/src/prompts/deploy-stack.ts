import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export function registerDeployStackPrompt(server: McpServer): void {
  server.registerPrompt(
    "deploy-stack",
    {
      title: "Deploy Stack",
      description: "Guided deployment of a Docker Compose stack to Portainer",
      argsSchema: {
        stackName: z.string().describe("Name for the stack to deploy"),
        composeContent: z.string().describe("Docker Compose YAML content (optional, will guide creation if omitted)").optional(),
      },
    },
    (args) => ({
      messages: [
        {
          role: "user" as const,
          content: {
            type: "text" as const,
            text: `Please help me deploy a Docker Compose stack named "${args.stackName}" to Portainer.

${args.composeContent ? `Here is the Docker Compose content to deploy:\n\n\`\`\`yaml\n${args.composeContent}\n\`\`\`` : "I don't have a compose file yet. Please help me create one."}

Use the available Portainer tools to:
1. List available environments to determine where to deploy
2. Check if a stack with this name already exists
3. ${args.composeContent ? "Validate the compose content and deploy the stack" : "Help me build a compose file, then deploy it"}

Please also:
- Verify the target environment is healthy and accessible
- Check for any port conflicts with existing stacks
- Confirm environment variables and volumes are properly configured
- Deploy the stack and verify it starts successfully`,
          },
        },
      ],
    })
  );
}
