import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerDeviceTools } from "./devices.js";
import { registerBuildTools } from "./build.js";
import { registerUtilityTools } from "./utility.js";
import { registerManagementTools } from "./management.js";

export function registerTools(server: McpServer): void {
  registerDeviceTools(server);
  registerBuildTools(server);
  registerUtilityTools(server);
  registerManagementTools(server);
}
