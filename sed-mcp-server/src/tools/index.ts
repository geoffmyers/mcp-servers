import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerSedTools } from "./sed.js";

export function registerTools(server: McpServer): void {
  registerSedTools(server);
}
