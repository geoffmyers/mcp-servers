import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { getPortainerClient } from "../lib/portainer-client.js";
import { formatErrorForMcp } from "../lib/errors.js";

export function registerStackTools(server: McpServer): void {
  server.tool(
    "list_stacks",
    "List all Portainer stacks",
    {},
    async (): Promise<CallToolResult> => {
      try {
        const client = getPortainerClient();
        const result = await client.get("/stacks");
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.tool(
    "create_stack",
    "Create a new standalone Docker Compose stack",
    {
      name: z.string().describe("Stack name"),
      stackFileContent: z.string().describe("Docker Compose file content (YAML)"),
      endpointId: z.number().describe("Environment/endpoint ID to deploy to"),
      env: z.array(z.object({ name: z.string(), value: z.string() })).optional().describe("Environment variables"),
    },
    async ({ name, stackFileContent, endpointId, env }): Promise<CallToolResult> => {
      try {
        const client = getPortainerClient();
        const result = await client.post("/stacks/create/standalone/string", {
          name,
          stackFileContent,
          env: env ?? [],
          endpointId,
        });
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.tool(
    "update_stack",
    "Update an existing stack's compose file and settings",
    {
      id: z.number().describe("Stack ID"),
      endpointId: z.number().describe("Environment/endpoint ID"),
      stackFileContent: z.string().describe("Updated Docker Compose file content (YAML)"),
      env: z.array(z.object({ name: z.string(), value: z.string() })).optional().describe("Environment variables"),
      prune: z.boolean().optional().describe("Remove services not defined in the updated compose file"),
    },
    async ({ id, endpointId, stackFileContent, env, prune }): Promise<CallToolResult> => {
      try {
        const client = getPortainerClient();
        const result = await client.put(`/stacks/${id}?endpointId=${endpointId}`, {
          stackFileContent,
          env: env ?? [],
          prune: prune ?? false,
        });
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.tool(
    "delete_stack",
    "Delete a stack (destructive - requires confirm: true)",
    {
      id: z.number().describe("Stack ID"),
      endpointId: z.number().describe("Environment/endpoint ID"),
      confirm: z.boolean().describe("Must be true to confirm deletion"),
    },
    async ({ id, endpointId, confirm }): Promise<CallToolResult> => {
      if (!confirm) {
        return { content: [{ type: "text", text: "Deletion aborted: confirm must be true." }] };
      }
      try {
        const client = getPortainerClient();
        const result = await client.delete(`/stacks/${id}?endpointId=${endpointId}`);
        return { content: [{ type: "text", text: JSON.stringify({ success: true, message: `Stack ${id} deleted` }, null, 2) }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.tool(
    "start_stack",
    "Start a stopped stack",
    {
      id: z.number().describe("Stack ID"),
      endpointId: z.number().describe("Environment/endpoint ID"),
    },
    async ({ id, endpointId }): Promise<CallToolResult> => {
      try {
        const client = getPortainerClient();
        const result = await client.post(`/stacks/${id}/start`, { endpointId });
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.tool(
    "stop_stack",
    "Stop a running stack",
    {
      id: z.number().describe("Stack ID"),
      endpointId: z.number().describe("Environment/endpoint ID"),
    },
    async ({ id, endpointId }): Promise<CallToolResult> => {
      try {
        const client = getPortainerClient();
        const result = await client.post(`/stacks/${id}/stop`, { endpointId });
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.tool(
    "get_stack_file",
    "Get the Docker Compose file content for a stack",
    {
      id: z.number().describe("Stack ID"),
    },
    async ({ id }): Promise<CallToolResult> => {
      try {
        const client = getPortainerClient();
        const result = await client.get(`/stacks/${id}/file`);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );
}
