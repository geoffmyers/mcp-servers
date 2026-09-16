import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerSystemTools } from "./system.js";
import { registerClientTools } from "./clients.js";
import { registerDeviceTools } from "./devices.js";
import { registerNetworkTools } from "./networks.js";
import { registerWlanTools } from "./wlans.js";
import { registerEventTools } from "./events.js";
import { registerDiagnosticTools } from "./diagnostics.js";
import { registerStatsTools } from "./stats.js";

export function registerTools(server: McpServer): void {
  registerSystemTools(server);
  registerClientTools(server);
  registerDeviceTools(server);
  registerNetworkTools(server);
  registerWlanTools(server);
  registerEventTools(server);
  registerDiagnosticTools(server);
  registerStatsTools(server);
}
