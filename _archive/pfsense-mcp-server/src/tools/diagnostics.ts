import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { getPfSenseClient } from "../lib/pfsense-client.js";
import { formatErrorForMcp } from "../lib/errors.js";

export function registerDiagnosticTools(server: McpServer): void {
  server.tool(
    "get_arp_table",
    "Get the pfSense ARP table showing IP-to-MAC address mappings",
    {},
    async (): Promise<CallToolResult> => {
      try {
        const client = getPfSenseClient();
        const result = await client.get("/diagnostics/arp_table");
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.tool(
    "run_ping",
    "Run a ping diagnostic from pfSense to a specified host",
    {
      host: z.string().describe("Hostname or IP address to ping"),
      count: z.number().optional().default(4).describe("Number of ping packets to send (default: 4)"),
    },
    async (args): Promise<CallToolResult> => {
      try {
        const client = getPfSenseClient();
        const result = await client.post("/diagnostics/ping", {
          host: args.host,
          count: args.count,
        });
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.tool(
    "get_firewall_states",
    "Get active pfSense firewall states (connection tracking table)",
    {},
    async (): Promise<CallToolResult> => {
      try {
        const client = getPfSenseClient();
        const result = await client.get("/firewall/states");
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.tool(
    "get_routing_table",
    "Get the pfSense routing table",
    {},
    async (): Promise<CallToolResult> => {
      try {
        const client = getPfSenseClient();
        const result = await client.get("/routing/gateways");
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );
}
