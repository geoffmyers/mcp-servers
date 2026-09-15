import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerNetworkReconPrompt } from "./network-recon.js";

export function registerPrompts(server: McpServer): void {
  registerNetworkReconPrompt(server);
}
