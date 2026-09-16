import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerSearchHelpPrompt } from "./search-help.js";

export function registerPrompts(server: McpServer): void {
  registerSearchHelpPrompt(server);
}
