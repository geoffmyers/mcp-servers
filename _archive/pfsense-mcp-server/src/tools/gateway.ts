import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { getPfSenseClient } from "../lib/pfsense-client.js";
import { formatErrorForMcp } from "../lib/errors.js";

export function registerGatewayTools(server: McpServer): void {
  server.tool(
    "get_gateway_status",
    "Get pfSense gateway health status including latency and packet loss",
    {},
    async (): Promise<CallToolResult> => {
      try {
        const client = getPfSenseClient();
        const result = await client.get("/status/gateways");
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );
}
