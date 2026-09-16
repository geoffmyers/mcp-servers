import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { getPfSenseClient } from "../lib/pfsense-client.js";
import { formatErrorForMcp } from "../lib/errors.js";

export function registerServiceTools(server: McpServer): void {
  server.tool(
    "list_services_status",
    "List the status of all running pfSense services",
    {},
    async (): Promise<CallToolResult> => {
      try {
        const client = getPfSenseClient();
        const result = await client.get("/status/services");
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.tool(
    "get_dhcp_leases",
    "Get the DHCP lease table from pfSense",
    {},
    async (): Promise<CallToolResult> => {
      try {
        const client = getPfSenseClient();
        const result = await client.get("/status/dhcp_server/leases");
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.tool(
    "get_dns_resolver",
    "Get the pfSense DNS resolver (Unbound) configuration",
    {},
    async (): Promise<CallToolResult> => {
      try {
        const client = getPfSenseClient();
        const result = await client.get("/services/dns_resolver/settings");
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.tool(
    "update_dns_resolver",
    "Update the pfSense DNS resolver (Unbound) configuration",
    {
      enable: z.boolean().optional().describe("Enable or disable DNS resolver"),
      dnssec: z.boolean().optional().describe("Enable or disable DNSSEC"),
      forwarding: z.boolean().optional().describe("Enable or disable DNS query forwarding"),
      custom_options: z.string().optional().describe("Custom Unbound configuration options"),
    },
    async (args): Promise<CallToolResult> => {
      try {
        const client = getPfSenseClient();
        const result = await client.patch("/services/dns_resolver/settings", args);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.tool(
    "get_dhcp_server_config",
    "Get the pfSense DHCP server configuration",
    {},
    async (): Promise<CallToolResult> => {
      try {
        const client = getPfSenseClient();
        const result = await client.get("/services/dhcp_servers");
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.tool(
    "create_dhcp_static_mapping",
    "Create a DHCP static mapping (reservation) on pfSense",
    {
      interface: z.string().describe("Interface name (e.g. lan)"),
      mac: z.string().describe("MAC address (e.g. aa:bb:cc:dd:ee:ff)"),
      ipaddr: z.string().describe("IP address to assign"),
      hostname: z.string().optional().describe("Hostname for the mapping"),
      descr: z.string().optional().describe("Description of the static mapping"),
    },
    async (args): Promise<CallToolResult> => {
      try {
        const client = getPfSenseClient();
        const result = await client.post("/services/dhcp_server/static_mapping", args);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );
}
