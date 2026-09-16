import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerNetworkHealthPrompt } from "./network-health.js";
import { registerClientTroubleshootPrompt } from "./client-troubleshoot.js";
import { registerWifiOptimizationPrompt } from "./wifi-optimization.js";

export function registerPrompts(server: McpServer): void {
  registerNetworkHealthPrompt(server);
  registerClientTroubleshootPrompt(server);
  registerWifiOptimizationPrompt(server);
}
