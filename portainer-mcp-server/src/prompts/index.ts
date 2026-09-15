import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerDeployStackPrompt } from "./deploy-stack.js";
import { registerTroubleshootContainerPrompt } from "./troubleshoot-container.js";
import { registerEnvironmentOverviewPrompt } from "./environment-overview.js";

export function registerPrompts(server: McpServer): void {
  registerDeployStackPrompt(server);
  registerTroubleshootContainerPrompt(server);
  registerEnvironmentOverviewPrompt(server);
}
