import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { getUniFiClient } from "../lib/unifi-client.js";
import { formatErrorForMcp } from "../lib/errors.js";

export function registerDnsTools(server: McpServer): void {
  server.tool(
    "list_dns_records",
    "List all DNS records",
    {},
    async (): Promise<CallToolResult> => {
      try {
        const client = getUniFiClient();
        const result = await client.rest("GET", "/dnsrecord");
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );
}
