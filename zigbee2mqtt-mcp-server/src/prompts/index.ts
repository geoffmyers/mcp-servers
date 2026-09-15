import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerDiagnoseDevicePrompt } from "./diagnose-device.js";
import { registerNetworkHealthPrompt } from "./network-health.js";

export function registerPrompts(server: McpServer): void {
  registerDiagnoseDevicePrompt(server);
  registerNetworkHealthPrompt(server);
}
