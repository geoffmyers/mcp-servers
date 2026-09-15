import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerRsyncTools } from "./rsync.js";

export function registerTools(server: McpServer): void {
  registerRsyncTools(server);
}
