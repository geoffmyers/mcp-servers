import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerXargsTools } from "./xargs.js";

export function registerTools(server: McpServer): void {
  registerXargsTools(server);
}
