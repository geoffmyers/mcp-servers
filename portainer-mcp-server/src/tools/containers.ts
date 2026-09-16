import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { getPortainerClient } from "../lib/portainer-client.js";
import { formatErrorForMcp } from "../lib/errors.js";

export function registerContainerTools(server: McpServer): void {
  server.tool(
    "list_containers",
    "List all containers in an environment (including stopped)",
    {
      environmentId: z.number().describe("Environment/endpoint ID"),
    },
    async ({ environmentId }): Promise<CallToolResult> => {
      try {
        const client = getPortainerClient();
        const result = await client.get(`/endpoints/${environmentId}/docker/containers/json?all=true`);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.tool(
    "inspect_container",
    "Get detailed information about a container",
    {
      environmentId: z.number().describe("Environment/endpoint ID"),
      id: z.string().describe("Container ID or name"),
    },
    async ({ environmentId, id }): Promise<CallToolResult> => {
      try {
        const client = getPortainerClient();
        const result = await client.get(`/endpoints/${environmentId}/docker/containers/${id}/json`);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.tool(
    "start_container",
    "Start a stopped container",
    {
      environmentId: z.number().describe("Environment/endpoint ID"),
      id: z.string().describe("Container ID or name"),
    },
    async ({ environmentId, id }): Promise<CallToolResult> => {
      try {
        const client = getPortainerClient();
        await client.post(`/endpoints/${environmentId}/docker/containers/${id}/start`, {});
        return { content: [{ type: "text", text: JSON.stringify({ success: true, message: `Container ${id} started` }, null, 2) }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.tool(
    "stop_container",
    "Stop a running container",
    {
      environmentId: z.number().describe("Environment/endpoint ID"),
      id: z.string().describe("Container ID or name"),
    },
    async ({ environmentId, id }): Promise<CallToolResult> => {
      try {
        const client = getPortainerClient();
        await client.post(`/endpoints/${environmentId}/docker/containers/${id}/stop`, {});
        return { content: [{ type: "text", text: JSON.stringify({ success: true, message: `Container ${id} stopped` }, null, 2) }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.tool(
    "restart_container",
    "Restart a container",
    {
      environmentId: z.number().describe("Environment/endpoint ID"),
      id: z.string().describe("Container ID or name"),
    },
    async ({ environmentId, id }): Promise<CallToolResult> => {
      try {
        const client = getPortainerClient();
        await client.post(`/endpoints/${environmentId}/docker/containers/${id}/restart`, {});
        return { content: [{ type: "text", text: JSON.stringify({ success: true, message: `Container ${id} restarted` }, null, 2) }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.tool(
    "remove_container",
    "Remove a container (destructive - requires confirm: true)",
    {
      environmentId: z.number().describe("Environment/endpoint ID"),
      id: z.string().describe("Container ID or name"),
      confirm: z.boolean().describe("Must be true to confirm removal"),
    },
    async ({ environmentId, id, confirm }): Promise<CallToolResult> => {
      if (!confirm) {
        return { content: [{ type: "text", text: "Removal aborted: confirm must be true." }] };
      }
      try {
        const client = getPortainerClient();
        await client.delete(`/endpoints/${environmentId}/docker/containers/${id}?force=true`);
        return { content: [{ type: "text", text: JSON.stringify({ success: true, message: `Container ${id} removed` }, null, 2) }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.tool(
    "get_container_logs",
    "Get recent logs from a container (last 100 lines)",
    {
      environmentId: z.number().describe("Environment/endpoint ID"),
      id: z.string().describe("Container ID or name"),
    },
    async ({ environmentId, id }): Promise<CallToolResult> => {
      try {
        const client = getPortainerClient();
        const logs = await client.getText(`/endpoints/${environmentId}/docker/containers/${id}/logs?stdout=true&stderr=true&tail=100`);
        return { content: [{ type: "text", text: logs }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );
}
