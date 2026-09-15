import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { getPortainerClient } from "../lib/portainer-client.js";
import { formatErrorForMcp } from "../lib/errors.js";

export function registerNetworkTools(server: McpServer): void {
  server.tool(
    "list_networks",
    "List all Docker networks in an environment",
    {
      environmentId: z.number().describe("Environment/endpoint ID"),
    },
    async ({ environmentId }): Promise<CallToolResult> => {
      try {
        const client = getPortainerClient();
        const result = await client.get(`/endpoints/${environmentId}/docker/networks`);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.tool(
    "create_network",
    "Create a new Docker network",
    {
      environmentId: z.number().describe("Environment/endpoint ID"),
      Name: z.string().describe("Network name"),
      Driver: z.string().optional().default("bridge").describe("Network driver (default: bridge)"),
      Internal: z.boolean().optional().default(false).describe("Restrict external access to the network"),
    },
    async ({ environmentId, Name, Driver, Internal }): Promise<CallToolResult> => {
      try {
        const client = getPortainerClient();
        const result = await client.post(`/endpoints/${environmentId}/docker/networks/create`, { Name, Driver, Internal });
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.tool(
    "remove_network",
    "Remove a Docker network (destructive - requires confirm: true)",
    {
      environmentId: z.number().describe("Environment/endpoint ID"),
      id: z.string().describe("Network ID or name"),
      confirm: z.boolean().describe("Must be true to confirm removal"),
    },
    async ({ environmentId, id, confirm }): Promise<CallToolResult> => {
      if (!confirm) {
        return { content: [{ type: "text", text: "Removal aborted: confirm must be true." }] };
      }
      try {
        const client = getPortainerClient();
        await client.delete(`/endpoints/${environmentId}/docker/networks/${encodeURIComponent(id)}`);
        return { content: [{ type: "text", text: JSON.stringify({ success: true, message: `Network ${id} removed` }, null, 2) }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );
}
