import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerContainerTools } from "./containers.js";
import { registerImageTools } from "./images.js";
import { registerVolumeTools } from "./volumes.js";
import { registerNetworkTools } from "./networks.js";
import { registerComposeTools } from "./compose.js";
import { registerSystemTools } from "./system.js";

export function registerTools(server: McpServer): void {
  registerContainerTools(server);
  registerImageTools(server);
  registerVolumeTools(server);
  registerNetworkTools(server);
  registerComposeTools(server);
  registerSystemTools(server);
}
