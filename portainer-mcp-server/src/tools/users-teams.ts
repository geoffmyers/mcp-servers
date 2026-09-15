import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { getPortainerClient } from "../lib/portainer-client.js";
import { formatErrorForMcp } from "../lib/errors.js";

export function registerUsersTeamsTools(server: McpServer): void {
  server.tool(
    "list_users",
    "List all Portainer users",
    {},
    async (): Promise<CallToolResult> => {
      try {
        const client = getPortainerClient();
        const result = await client.get("/users");
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.tool(
    "list_teams",
    "List all Portainer teams",
    {},
    async (): Promise<CallToolResult> => {
      try {
        const client = getPortainerClient();
        const result = await client.get("/teams");
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.tool(
    "update_user_role",
    "Update a user's role (1=admin, 2=user)",
    {
      id: z.number().describe("User ID"),
      role: z.union([z.literal(1), z.literal(2)]).describe("Role: 1=admin, 2=user"),
    },
    async ({ id, role }): Promise<CallToolResult> => {
      try {
        const client = getPortainerClient();
        const result = await client.put(`/users/${id}`, { role });
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.tool(
    "create_team",
    "Create a new team",
    {
      name: z.string().describe("Team name"),
    },
    async ({ name }): Promise<CallToolResult> => {
      try {
        const client = getPortainerClient();
        const result = await client.post("/teams", { name });
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.tool(
    "update_team_members",
    "Update team membership for a user (role: 1=leader, 2=member)",
    {
      id: z.number().describe("Team membership ID"),
      userID: z.number().describe("User ID"),
      teamID: z.number().describe("Team ID"),
      role: z.union([z.literal(1), z.literal(2)]).describe("Role: 1=leader, 2=member"),
    },
    async ({ id, userID, teamID, role }): Promise<CallToolResult> => {
      try {
        const client = getPortainerClient();
        const result = await client.put(`/team_memberships/${id}`, { userID, teamID, role });
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );
}
