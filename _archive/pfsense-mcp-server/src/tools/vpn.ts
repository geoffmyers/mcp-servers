import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { getPfSenseClient } from "../lib/pfsense-client.js";
import { formatErrorForMcp } from "../lib/errors.js";

export function registerVpnTools(server: McpServer): void {
  server.tool(
    "list_openvpn_servers",
    "List all pfSense OpenVPN server configurations",
    {},
    async (): Promise<CallToolResult> => {
      try {
        const client = getPfSenseClient();
        const result = await client.get("/vpn/openvpn/servers");
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.tool(
    "get_openvpn_status",
    "Get the current OpenVPN connection status",
    {},
    async (): Promise<CallToolResult> => {
      try {
        const client = getPfSenseClient();
        const result = await client.get("/status/openvpn/servers");
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.tool(
    "get_ipsec_status",
    "Get the current IPsec tunnel status",
    {},
    async (): Promise<CallToolResult> => {
      try {
        const client = getPfSenseClient();
        const result = await client.get("/status/ipsec/sas");
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.tool(
    "get_wireguard_status",
    "Get the current WireGuard tunnel status",
    {},
    async (): Promise<CallToolResult> => {
      try {
        const client = getPfSenseClient();
        const result = await client.get("/vpn/wireguard/settings");
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );
}
