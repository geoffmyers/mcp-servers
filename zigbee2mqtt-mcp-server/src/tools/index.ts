import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerDeviceTools } from "./devices.js";
import { registerControlTools } from "./control.js";
import { registerManagementTools } from "./management.js";
import { registerNetworkTools } from "./network.js";
import { registerBridgeTools } from "./bridge.js";
import { registerContainerTools } from "./container.js";
import { registerGroupTools } from "./groups.js";
import { registerBindingTools } from "./binding.js";
import { registerOtaTools } from "./ota.js";

export function registerTools(server: McpServer): void {
  registerDeviceTools(server);
  registerControlTools(server);
  registerManagementTools(server);
  registerNetworkTools(server);
  registerBridgeTools(server);
  registerContainerTools(server);
  registerGroupTools(server);
  registerBindingTools(server);
  registerOtaTools(server);
}
