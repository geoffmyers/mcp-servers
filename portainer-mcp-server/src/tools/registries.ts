import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { getPortainerClient } from "../lib/portainer-client.js";
import { formatErrorForMcp } from "../lib/errors.js";

export function registerRegistryTools(server: McpServer): void {
  server.tool(
    "list_registries",
    "List all configured container registries",
    {},
    async (): Promise<CallToolResult> => {
      try {
        const client = getPortainerClient();
        const result = await client.get("/registries");
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.tool(
    "create_registry",
    "Create a new container registry configuration. Type: 1=Quay, 2=Azure, 3=Custom, 4=GitLab, 5=ProGet, 6=DockerHub, 7=ECR, 8=GitHub",
    {
      name: z.string().describe("Registry name"),
      type: z.number().min(1).max(8).describe("Registry type (1=Quay, 2=Azure, 3=Custom, 4=GitLab, 5=ProGet, 6=DockerHub, 7=ECR, 8=GitHub)"),
      url: z.string().describe("Registry URL"),
      authentication: z.boolean().optional().describe("Whether authentication is required"),
      username: z.string().optional().describe("Registry username"),
      password: z.string().optional().describe("Registry password"),
    },
    async ({ name, type, url, authentication, username, password }): Promise<CallToolResult> => {
      try {
        const client = getPortainerClient();
        const body: Record<string, unknown> = { name, type, url };
        if (authentication !== undefined) body.authentication = authentication;
        if (username !== undefined) body.username = username;
        if (password !== undefined) body.password = password;
        const result = await client.post("/registries", body);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.tool(
    "update_registry",
    "Update an existing container registry configuration",
    {
      id: z.number().describe("Registry ID"),
      name: z.string().optional().describe("Registry name"),
      url: z.string().optional().describe("Registry URL"),
      authentication: z.boolean().optional().describe("Whether authentication is required"),
      username: z.string().optional().describe("Registry username"),
      password: z.string().optional().describe("Registry password"),
    },
    async ({ id, name, url, authentication, username, password }): Promise<CallToolResult> => {
      try {
        const client = getPortainerClient();
        const body: Record<string, unknown> = {};
        if (name !== undefined) body.name = name;
        if (url !== undefined) body.url = url;
        if (authentication !== undefined) body.authentication = authentication;
        if (username !== undefined) body.username = username;
        if (password !== undefined) body.password = password;
        const result = await client.put(`/registries/${id}`, body);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );
}
