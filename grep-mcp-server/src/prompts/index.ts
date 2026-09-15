import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerRegexHelpPrompt } from "./regex-help.js";

export function registerPrompts(server: McpServer): void {
  registerRegexHelpPrompt(server);
}
