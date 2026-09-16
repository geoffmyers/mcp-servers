import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { getPortainerClient } from "../lib/portainer-client.js";
import { formatErrorForMcp } from "../lib/errors.js";

export function registerVolumeTools(server: McpServer): void {
  server.tool(
    "list_volumes",
    "List all Docker volumes in an environment",
    {
      environmentId: z.number().describe("Environment/endpoint ID"),
    },
    async ({ environmentId }): Promise<CallToolResult> => {
      try {
        const client = getPortainerClient();
        const result = await client.get(`/endpoints/${environmentId}/docker/volumes`);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.tool(
    "create_volume",
    "Create a new Docker volume",
    {
      environmentId: z.number().describe("Environment/endpoint ID"),
      Name: z.string().describe("Volume name"),
      Driver: z.string().optional().default("local").describe("Volume driver (default: local)"),
    },
    async ({ environmentId, Name, Driver }): Promise<CallToolResult> => {
      try {
        const client = getPortainerClient();
        const result = await client.post(`/endpoints/${environmentId}/docker/volumes/create`, { Name, Driver });
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.tool(
    "remove_volume",
    "Remove a Docker volume (destructive - requires confirm: true)",
    {
      environmentId: z.number().describe("Environment/endpoint ID"),
      name: z.string().describe("Volume name"),
      confirm: z.boolean().describe("Must be true to confirm removal"),
    },
    async ({ environmentId, name, confirm }): Promise<CallToolResult> => {
      if (!confirm) {
        return { content: [{ type: "text", text: "Removal aborted: confirm must be true." }] };
      }
      try {
        const client = getPortainerClient();
        await client.delete(`/endpoints/${environmentId}/docker/volumes/${encodeURIComponent(name)}`);
        return { content: [{ type: "text", text: JSON.stringify({ success: true, message: `Volume ${name} removed` }, null, 2) }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );
}
