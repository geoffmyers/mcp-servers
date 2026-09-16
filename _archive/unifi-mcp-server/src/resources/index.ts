import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerSystemInfoResource } from "./system-info.js";
import { registerSiteResources } from "./sites.js";
import { registerDeviceResources } from "./devices.js";
import { registerActiveClientResources } from "./active-clients.js";

export function registerResources(server: McpServer): void {
  registerSystemInfoResource(server);
  registerSiteResources(server);
  registerDeviceResources(server);
  registerActiveClientResources(server);
}
