import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerNmapTools } from "./nmap.js";

export function registerTools(server: McpServer): void {
  registerNmapTools(server);
}
