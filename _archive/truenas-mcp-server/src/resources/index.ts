import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerSystemInfoResource } from "./system-info.js";
import { registerPoolResources } from "./pools.js";
import { registerDatasetResources } from "./datasets.js";
import { registerAlertResources } from "./alerts.js";
import { registerServiceResources } from "./services.js";

export function registerResources(server: McpServer): void {
  registerSystemInfoResource(server);
  registerPoolResources(server);
  registerDatasetResources(server);
  registerAlertResources(server);
  registerServiceResources(server);
}
