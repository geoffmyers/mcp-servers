import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerCoreTools } from "./core.js";
import { registerSupervisorTools } from "./supervisor.js";
import { registerAddonTools } from "./addons.js";
import { registerOsTools } from "./os.js";
import { registerHostTools } from "./host.js";
import { registerResolutionTools } from "./resolution.js";
import { registerBackupTools } from "./backups.js";
import { registerNetworkTools } from "./network.js";

export function registerTools(server: McpServer): void {
  registerCoreTools(server);
  registerSupervisorTools(server);
  registerAddonTools(server);
  registerOsTools(server);
  registerHostTools(server);
  registerResolutionTools(server);
  registerBackupTools(server);
  registerNetworkTools(server);
}
