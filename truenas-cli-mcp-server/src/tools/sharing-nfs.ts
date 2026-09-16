import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { executeAuto, getServerConfig, formatErrorForMcp } from "@geoffmyers/mcp-server-shared";

export function registerNfsTools(server: McpServer): void {
  const config = getServerConfig();

  server.tool(
    "list_nfs_exports",
    "List all NFS exports",
    {},
    async (): Promise<CallToolResult> => {
      try {
        const result = await executeAuto(config, "midclt", ["call", "sharing.nfs.query"]);
        if (result.exitCode !== 0) {
          return { isError: true, content: [{ type: "text", text: `midclt call sharing.nfs.query failed: ${result.stderr}` }] };
        }
        return { content: [{ type: "text", text: result.stdout }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.tool(
    "create_nfs_export",
    "Create a new NFS export",
    {
      path: z.string().describe("Filesystem path to export (e.g. '/mnt/main/data/nfs')"),
    },
    async (args): Promise<CallToolResult> => {
      try {
        const payload = JSON.stringify({ path: args.path });
        const result = await executeAuto(config, "midclt", ["call", "sharing.nfs.create", payload]);
        if (result.exitCode !== 0) {
          return { isError: true, content: [{ type: "text", text: `midclt call sharing.nfs.create failed: ${result.stderr}` }] };
        }
        return { content: [{ type: "text", text: result.stdout || `NFS export created at ${args.path}.` }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.tool(
    "delete_nfs_export",
    "Delete an NFS export (requires confirm: true)",
    {
      id: z.coerce.number().int().describe("NFS export ID"),
      confirm: z.boolean().describe("Must be true to execute this destructive operation"),
    },
    async (args): Promise<CallToolResult> => {
      if (!args.confirm) {
        return { isError: true, content: [{ type: "text", text: "Destructive operation: set confirm: true to delete this NFS export." }] };
      }
      try {
        const result = await executeAuto(config, "midclt", ["call", "sharing.nfs.delete", String(args.id)]);
        if (result.exitCode !== 0) {
          return { isError: true, content: [{ type: "text", text: `midclt call sharing.nfs.delete failed: ${result.stderr}` }] };
        }
        return { content: [{ type: "text", text: result.stdout || `NFS export ${args.id} deleted.` }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );
}
