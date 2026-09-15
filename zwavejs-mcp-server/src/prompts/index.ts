import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerDiagnoseNodePrompt } from "./diagnose-node.js";
import { registerNetworkHealthPrompt } from "./network-health.js";

export function registerPrompts(server: McpServer): void {
  registerDiagnoseNodePrompt(server);
  registerNetworkHealthPrompt(server);
}
