import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { getPfSenseClient } from "../lib/pfsense-client.js";
import { formatErrorForMcp } from "../lib/errors.js";

export function registerAliasTools(server: McpServer): void {
  server.tool(
    "list_aliases",
    "List all pfSense firewall aliases",
    {},
    async (): Promise<CallToolResult> => {
      try {
        const client = getPfSenseClient();
        const result = await client.get("/firewall/aliases");
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.tool(
    "create_alias",
    "Create a new pfSense firewall alias",
    {
      name: z.string().describe("Alias name (alphanumeric and underscores only)"),
      type: z.enum(["host", "network", "port", "url"]).describe("Alias type"),
      address: z.array(z.string()).describe("Array of addresses, networks, ports, or URLs"),
      descr: z.string().optional().describe("Alias description"),
    },
    async (args): Promise<CallToolResult> => {
      try {
        const client = getPfSenseClient();
        const result = await client.post("/firewall/alias", args);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.tool(
    "update_alias",
    "Update an existing pfSense firewall alias",
    {
      id: z.number().describe("Alias ID to update"),
      name: z.string().optional().describe("Alias name"),
      type: z.enum(["host", "network", "port", "url"]).optional().describe("Alias type"),
      address: z.array(z.string()).optional().describe("Array of addresses"),
      descr: z.string().optional().describe("Alias description"),
    },
    async (args): Promise<CallToolResult> => {
      try {
        const client = getPfSenseClient();
        const { id, ...body } = args;
        const result = await client.patch(`/firewall/alias?id=${id}`, body);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.tool(
    "delete_alias",
    "Delete a pfSense firewall alias",
    {
      id: z.number().describe("Alias ID to delete"),
      confirm: z.boolean().describe("Must be true to confirm deletion"),
    },
    async (args): Promise<CallToolResult> => {
      try {
        if (!args.confirm) {
          return { content: [{ type: "text", text: "Operation requires confirm: true" }] };
        }
        const client = getPfSenseClient();
        const result = await client.delete("/firewall/alias", { id: String(args.id) });
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );
}
