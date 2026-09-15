import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerSedHelpPrompt } from "./sed-help.js";

export function registerPrompts(server: McpServer): void {
  registerSedHelpPrompt(server);
}
