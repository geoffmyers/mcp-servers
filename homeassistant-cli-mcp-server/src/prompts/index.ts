import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerHealthCheckPrompt } from "./health-check.js";
import { registerDiagnoseAddonPrompt } from "./diagnose-addon.js";

export function registerPrompts(server: McpServer): void {
  registerHealthCheckPrompt(server);
  registerDiagnoseAddonPrompt(server);
}
