import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { executeAuto, getServerConfig, formatErrorForMcp } from "@geoffmyers/mcp-server-shared";

export function registerBackupTools(server: McpServer): void {
  const config = getServerConfig();

  server.tool(
    "backup_list",
    "List all Home Assistant backups",
    {},
    async (): Promise<CallToolResult> => {
      try {
        const result = await executeAuto(config, "ha", ["backups", "list", "--raw-json"]);
        if (result.exitCode !== 0) {
          return { isError: true, content: [{ type: "text", text: `ha backups list failed: ${result.stderr}` }] };
        }
        return { content: [{ type: "text", text: result.stdout }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.tool(
    "backup_info",
    "Get detailed information about a specific backup",
    {
      slug: z.string().describe("Backup slug identifier"),
    },
    async (args): Promise<CallToolResult> => {
      try {
        const result = await executeAuto(config, "ha", ["backups", "info", args.slug, "--raw-json"]);
        if (result.exitCode !== 0) {
          return { isError: true, content: [{ type: "text", text: `ha backups info failed: ${result.stderr}` }] };
        }
        return { content: [{ type: "text", text: result.stdout }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.tool(
    "backup_create",
    "Create a new Home Assistant backup",
    {
      name: z.string().optional().describe("Backup name"),
    },
    async (args): Promise<CallToolResult> => {
      try {
        const cmdArgs = ["backups", "new"];
        if (args.name) {
          cmdArgs.push("--name", args.name);
        }
        cmdArgs.push("--raw-json");
        const result = await executeAuto(config, "ha", cmdArgs, { timeout: 300_000 });
        if (result.exitCode !== 0) {
          return { isError: true, content: [{ type: "text", text: `ha backups new failed: ${result.stderr}` }] };
        }
        return { content: [{ type: "text", text: result.stdout || "Backup creation initiated." }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.tool(
    "backup_restore",
    "Restore Home Assistant from a backup (requires confirm: true)",
    {
      slug: z.string().describe("Backup slug identifier"),
      confirm: z.boolean().describe("Must be true to execute this destructive operation"),
    },
    async (args): Promise<CallToolResult> => {
      if (!args.confirm) {
        return { isError: true, content: [{ type: "text", text: "Destructive operation: set confirm: true to restore from this backup." }] };
      }
      try {
        const result = await executeAuto(config, "ha", ["backups", "restore", args.slug, "--raw-json"], { timeout: 600_000 });
        if (result.exitCode !== 0) {
          return { isError: true, content: [{ type: "text", text: `ha backups restore failed: ${result.stderr}` }] };
        }
        return { content: [{ type: "text", text: result.stdout || "Backup restore initiated." }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.tool(
    "backup_remove",
    "Remove a Home Assistant backup (requires confirm: true)",
    {
      slug: z.string().describe("Backup slug identifier"),
      confirm: z.boolean().describe("Must be true to execute this destructive operation"),
    },
    async (args): Promise<CallToolResult> => {
      if (!args.confirm) {
        return { isError: true, content: [{ type: "text", text: "Destructive operation: set confirm: true to remove this backup." }] };
      }
      try {
        const result = await executeAuto(config, "ha", ["backups", "remove", args.slug, "--raw-json"]);
        if (result.exitCode !== 0) {
          return { isError: true, content: [{ type: "text", text: `ha backups remove failed: ${result.stderr}` }] };
        }
        return { content: [{ type: "text", text: result.stdout || "Backup removed." }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );
}
