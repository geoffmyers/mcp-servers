import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerFindTools } from "./find.js";

export function registerTools(server: McpServer): void {
  registerFindTools(server);
}
