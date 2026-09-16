import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { executeAuto, getServerConfig, formatErrorForMcp } from "@geoffmyers/mcp-server-shared";

export function registerSmbTools(server: McpServer): void {
  const config = getServerConfig();

  server.tool(
    "list_smb_shares",
    "List all SMB shares",
    {},
    async (): Promise<CallToolResult> => {
      try {
        const result = await executeAuto(config, "midclt", ["call", "sharing.smb.query"]);
        if (result.exitCode !== 0) {
          return { isError: true, content: [{ type: "text", text: `midclt call sharing.smb.query failed: ${result.stderr}` }] };
        }
        return { content: [{ type: "text", text: result.stdout }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.tool(
    "create_smb_share",
    "Create a new SMB share",
    {
      path: z.string().describe("Filesystem path to share (e.g. '/mnt/main/data/shared')"),
      name: z.string().describe("Share name visible on the network"),
    },
    async (args): Promise<CallToolResult> => {
      try {
        const payload = JSON.stringify({ path: args.path, name: args.name });
        const result = await executeAuto(config, "midclt", ["call", "sharing.smb.create", payload]);
        if (result.exitCode !== 0) {
          return { isError: true, content: [{ type: "text", text: `midclt call sharing.smb.create failed: ${result.stderr}` }] };
        }
        return { content: [{ type: "text", text: result.stdout || `SMB share "${args.name}" created at ${args.path}.` }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.tool(
    "delete_smb_share",
    "Delete an SMB share (requires confirm: true)",
    {
      id: z.coerce.number().int().describe("SMB share ID"),
      confirm: z.boolean().describe("Must be true to execute this destructive operation"),
    },
    async (args): Promise<CallToolResult> => {
      if (!args.confirm) {
        return { isError: true, content: [{ type: "text", text: "Destructive operation: set confirm: true to delete this SMB share." }] };
      }
      try {
        const result = await executeAuto(config, "midclt", ["call", "sharing.smb.delete", String(args.id)]);
        if (result.exitCode !== 0) {
          return { isError: true, content: [{ type: "text", text: `midclt call sharing.smb.delete failed: ${result.stderr}` }] };
        }
        return { content: [{ type: "text", text: result.stdout || `SMB share ${args.id} deleted.` }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );
}
