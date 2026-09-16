import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerSearchTools } from "./search.js";

export function registerTools(server: McpServer): void {
  registerSearchTools(server);
}
