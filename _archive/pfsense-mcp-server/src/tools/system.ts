import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { getPfSenseClient } from "../lib/pfsense-client.js";
import { formatErrorForMcp } from "../lib/errors.js";

export function registerSystemTools(server: McpServer): void {
  server.tool(
    "get_system_info",
    "Get pfSense system information including hostname, version, and platform",
    {},
    async (): Promise<CallToolResult> => {
      try {
        const client = getPfSenseClient();
        const result = await client.get("/system/version");
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.tool(
    "get_system_status",
    "Get pfSense system status including uptime, CPU usage, and memory usage",
    {},
    async (): Promise<CallToolResult> => {
      try {
        const client = getPfSenseClient();
        const result = await client.get("/status/system");
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.tool(
    "get_interface_status",
    "Get pfSense interface link states and status information",
    {},
    async (): Promise<CallToolResult> => {
      try {
        const client = getPfSenseClient();
        const result = await client.get("/status/interfaces");
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );
}
