import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerContainerHealthPrompt } from "./container-health.js";
import { registerStackStatusPrompt } from "./stack-status.js";

export function registerPrompts(server: McpServer): void {
  registerContainerHealthPrompt(server);
  registerStackStatusPrompt(server);
}
