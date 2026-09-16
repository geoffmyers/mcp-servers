import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerSystemInfoResource } from "./system-info.js";
import { registerEnvironmentResources } from "./environments.js";
import { registerStackResources } from "./stacks.js";

export function registerResources(server: McpServer): void {
  registerSystemInfoResource(server);
  registerEnvironmentResources(server);
  registerStackResources(server);
}
