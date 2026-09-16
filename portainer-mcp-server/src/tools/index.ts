import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerSystemTools } from "./system.js";
import { registerEnvironmentTools } from "./environments.js";
import { registerStackTools } from "./stacks.js";
import { registerContainerTools } from "./containers.js";
import { registerImageTools } from "./images.js";
import { registerVolumeTools } from "./volumes.js";
import { registerNetworkTools } from "./networks.js";
import { registerRegistryTools } from "./registries.js";
import { registerUsersTeamsTools } from "./users-teams.js";
import { registerTemplateTools } from "./templates.js";

export function registerTools(server: McpServer): void {
  registerSystemTools(server);
  registerEnvironmentTools(server);
  registerStackTools(server);
  registerContainerTools(server);
  registerImageTools(server);
  registerVolumeTools(server);
  registerNetworkTools(server);
  registerRegistryTools(server);
  registerUsersTeamsTools(server);
  registerTemplateTools(server);
}
