import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { executeAuto, getServerConfig, formatErrorForMcp } from "@geoffmyers/mcp-server-shared";

export function registerUserTools(server: McpServer): void {
  const config = getServerConfig();

  server.tool(
    "list_users",
    "List all users on the system",
    {},
    async (): Promise<CallToolResult> => {
      try {
        const result = await executeAuto(config, "midclt", ["call", "user.query"]);
        if (result.exitCode !== 0) {
          return { isError: true, content: [{ type: "text", text: `midclt call user.query failed: ${result.stderr}` }] };
        }
        return { content: [{ type: "text", text: result.stdout }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.tool(
    "create_user",
    "Create a new user account",
    {
      username: z.string().describe("Username for the new account"),
      full_name: z.string().describe("Full name of the user"),
      password: z.string().describe("Password for the account"),
      group_create: z.boolean().optional().default(true).describe("Create a new primary group for the user (default: true)"),
    },
    async (args): Promise<CallToolResult> => {
      try {
        const payload = JSON.stringify({
          username: args.username,
          full_name: args.full_name,
          password: args.password,
          group_create: args.group_create,
        });
        const result = await executeAuto(config, "midclt", ["call", "user.create", payload]);
        if (result.exitCode !== 0) {
          return { isError: true, content: [{ type: "text", text: `midclt call user.create failed: ${result.stderr}` }] };
        }
        return { content: [{ type: "text", text: result.stdout || `User "${args.username}" created.` }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.tool(
    "update_user",
    "Update an existing user account",
    {
      id: z.number().describe("User ID"),
      full_name: z.string().optional().describe("Updated full name"),
      password: z.string().optional().describe("Updated password"),
      locked: z.boolean().optional().describe("Lock or unlock the account"),
    },
    async (args): Promise<CallToolResult> => {
      try {
        const changes: Record<string, unknown> = {};
        if (args.full_name !== undefined) changes.full_name = args.full_name;
        if (args.password !== undefined) changes.password = args.password;
        if (args.locked !== undefined) changes.locked = args.locked;
        const result = await executeAuto(config, "midclt", ["call", "user.update", String(args.id), JSON.stringify(changes)]);
        if (result.exitCode !== 0) {
          return { isError: true, content: [{ type: "text", text: `midclt call user.update failed: ${result.stderr}` }] };
        }
        return { content: [{ type: "text", text: result.stdout || `User ${args.id} updated.` }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.tool(
    "delete_user",
    "Delete a user account (requires confirm: true)",
    {
      id: z.number().describe("User ID to delete"),
      confirm: z.boolean().describe("Must be true to execute this destructive operation"),
    },
    async (args): Promise<CallToolResult> => {
      if (!args.confirm) {
        return { isError: true, content: [{ type: "text", text: "Destructive operation: set confirm: true to delete this user." }] };
      }
      try {
        const result = await executeAuto(config, "midclt", ["call", "user.delete", String(args.id)]);
        if (result.exitCode !== 0) {
          return { isError: true, content: [{ type: "text", text: `midclt call user.delete failed: ${result.stderr}` }] };
        }
        return { content: [{ type: "text", text: result.stdout || `User ${args.id} deleted.` }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );
}
