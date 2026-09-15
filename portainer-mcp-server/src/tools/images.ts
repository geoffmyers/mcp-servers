import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { getPortainerClient } from "../lib/portainer-client.js";
import { formatErrorForMcp } from "../lib/errors.js";

export function registerImageTools(server: McpServer): void {
  server.tool(
    "list_images",
    "List all Docker images in an environment",
    {
      environmentId: z.number().describe("Environment/endpoint ID"),
    },
    async ({ environmentId }): Promise<CallToolResult> => {
      try {
        const client = getPortainerClient();
        const result = await client.get(`/endpoints/${environmentId}/docker/images/json`);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.tool(
    "pull_image",
    "Pull a Docker image from a registry",
    {
      environmentId: z.number().describe("Environment/endpoint ID"),
      fromImage: z.string().describe("Image name (e.g. nginx, ubuntu)"),
      tag: z.string().optional().default("latest").describe("Image tag (default: latest)"),
    },
    async ({ environmentId, fromImage, tag }): Promise<CallToolResult> => {
      try {
        const client = getPortainerClient();
        const result = await client.post(`/endpoints/${environmentId}/docker/images/create?fromImage=${encodeURIComponent(fromImage)}&tag=${encodeURIComponent(tag)}`, {});
        return { content: [{ type: "text", text: JSON.stringify({ success: true, message: `Image ${fromImage}:${tag} pulled` }, null, 2) }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.tool(
    "remove_image",
    "Remove a Docker image (destructive - requires confirm: true)",
    {
      environmentId: z.number().describe("Environment/endpoint ID"),
      name: z.string().describe("Image name or ID"),
      confirm: z.boolean().describe("Must be true to confirm removal"),
    },
    async ({ environmentId, name, confirm }): Promise<CallToolResult> => {
      if (!confirm) {
        return { content: [{ type: "text", text: "Removal aborted: confirm must be true." }] };
      }
      try {
        const client = getPortainerClient();
        const result = await client.delete(`/endpoints/${environmentId}/docker/images/${encodeURIComponent(name)}`);
        return { content: [{ type: "text", text: JSON.stringify({ success: true, message: `Image ${name} removed`, data: result }, null, 2) }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.tool(
    "prune_images",
    "Remove all unused Docker images (destructive - requires confirm: true)",
    {
      environmentId: z.number().describe("Environment/endpoint ID"),
      confirm: z.boolean().describe("Must be true to confirm pruning"),
    },
    async ({ environmentId, confirm }): Promise<CallToolResult> => {
      if (!confirm) {
        return { content: [{ type: "text", text: "Prune aborted: confirm must be true." }] };
      }
      try {
        const client = getPortainerClient();
        const result = await client.post(`/endpoints/${environmentId}/docker/images/prune`, {});
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );
}
