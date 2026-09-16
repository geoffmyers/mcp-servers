import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerNodeTools } from "./nodes.js";
import { registerControlTools } from "./control.js";
import { registerManagementTools } from "./management.js";
import { registerContainerTools } from "./container.js";
import { registerDiagnosticTools } from "./diagnostics.js";
import { registerInclusionTools } from "./inclusion.js";
import { registerConfigTools } from "./config.js";

export function registerTools(server: McpServer): void {
  registerNodeTools(server);
  registerControlTools(server);
  registerManagementTools(server);
  registerContainerTools(server);
  registerDiagnosticTools(server);
  registerInclusionTools(server);
  registerConfigTools(server);
}
