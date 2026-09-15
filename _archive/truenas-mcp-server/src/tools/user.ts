import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { getTrueNASClient } from "../lib/truenas-client.js";
import { formatErrorForMcp } from "../lib/errors.js";

export function registerUserTools(server: McpServer): void {
  server.registerTool(
    "list_users",
    {
      title: "List Users",
      description: "List all users on the TrueNAS system.",
      inputSchema: {},
    },
    async (): Promise<{ content: Array<{ type: "text"; text: string }> }> => {
      try {
        const client = getTrueNASClient();
        const result = await client.call("user.query");
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.registerTool(
    "create_user",
    {
      title: "Create User",
      description: "Create a new user on the TrueNAS system.",
      inputSchema: {
        username: z.string().describe("The username for the new user."),
        full_name: z.string().describe("The full name of the user."),
        password: z.string().describe("The password for the new user."),
        group_create: z.boolean().optional().describe("Automatically create a primary group for the user."),
        shell: z.string().optional().describe("The login shell (e.g. '/usr/bin/bash', '/usr/sbin/nologin')."),
        home: z.string().optional().describe("The home directory path (e.g. '/mnt/tank/home/username')."),
        email: z.string().optional().describe("The email address of the user."),
      },
    },
    async ({ username, full_name, password, group_create, shell, home, email }): Promise<{ content: Array<{ type: "text"; text: string }> }> => {
      try {
        const client = getTrueNASClient();
        const params: Record<string, unknown> = { username, full_name, password };
        if (group_create !== undefined) params.group_create = group_create;
        if (shell !== undefined) params.shell = shell;
        if (home !== undefined) params.home = home;
        if (email !== undefined) params.email = email;

        const result = await client.call("user.create", [params]);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.registerTool(
    "update_user",
    {
      title: "Update User",
      description: "Update an existing user on the TrueNAS system.",
      inputSchema: {
        id: z.number().describe("The numeric ID of the user to update."),
        username: z.string().optional().describe("New username."),
        full_name: z.string().optional().describe("New full name."),
        password: z.string().optional().describe("New password."),
        shell: z.string().optional().describe("New login shell."),
        home: z.string().optional().describe("New home directory path."),
        email: z.string().optional().describe("New email address."),
        locked: z.boolean().optional().describe("Lock or unlock the user account."),
      },
    },
    async ({ id, username, full_name, password, shell, home, email, locked }): Promise<{ content: Array<{ type: "text"; text: string }> }> => {
      try {
        const client = getTrueNASClient();
        const updates: Record<string, unknown> = {};
        if (username !== undefined) updates.username = username;
        if (full_name !== undefined) updates.full_name = full_name;
        if (password !== undefined) updates.password = password;
        if (shell !== undefined) updates.shell = shell;
        if (home !== undefined) updates.home = home;
        if (email !== undefined) updates.email = email;
        if (locked !== undefined) updates.locked = locked;

        const result = await client.call("user.update", [id, updates]);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.registerTool(
    "delete_user",
    {
      title: "Delete User",
      description: "Delete a user from the TrueNAS system. Requires explicit confirmation.",
      inputSchema: {
        id: z.number().describe("The numeric ID of the user to delete."),
        confirm: z.boolean().describe("Must be true to confirm the delete operation."),
      },
    },
    async ({ id, confirm }): Promise<{ content: Array<{ type: "text"; text: string }> }> => {
      if (!confirm) {
        return { content: [{ type: "text", text: "Delete aborted: confirm must be true." }] };
      }
      try {
        const client = getTrueNASClient();
        await client.call("user.delete", [id]);
        return { content: [{ type: "text", text: `User ${id} deleted successfully.` }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );
}
