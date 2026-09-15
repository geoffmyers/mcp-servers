import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { getTrueNASClient } from "../lib/truenas-client.js";
import { formatErrorForMcp } from "../lib/errors.js";

export function registerSmbTools(server: McpServer): void {
  server.registerTool(
    "list_smb_shares",
    {
      title: "List SMB Shares",
      description: "List all SMB (Windows/Samba) shares on the TrueNAS system.",
      inputSchema: {},
    },
    async (): Promise<{ content: Array<{ type: "text"; text: string }> }> => {
      try {
        const client = getTrueNASClient();
        const result = await client.call("sharing.smb.query");
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.registerTool(
    "create_smb_share",
    {
      title: "Create SMB Share",
      description: "Create a new SMB (Windows/Samba) share.",
      inputSchema: {
        path: z.string().describe("The filesystem path to share (e.g. '/mnt/tank/data')."),
        name: z.string().describe("The share name visible on the network."),
        comment: z.string().optional().describe("Optional description of the share."),
        ro: z.boolean().optional().describe("Set the share as read-only."),
        browsable: z.boolean().optional().describe("Whether the share is visible in network browsing."),
        guestok: z.boolean().optional().describe("Allow guest access without authentication."),
      },
    },
    async ({ path, name, comment, ro, browsable, guestok }): Promise<{ content: Array<{ type: "text"; text: string }> }> => {
      try {
        const client = getTrueNASClient();
        const params: Record<string, unknown> = { path, name };
        if (comment !== undefined) params.comment = comment;
        if (ro !== undefined) params.ro = ro;
        if (browsable !== undefined) params.browsable = browsable;
        if (guestok !== undefined) params.guestok = guestok;

        const result = await client.call("sharing.smb.create", [params]);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.registerTool(
    "delete_smb_share",
    {
      title: "Delete SMB Share",
      description: "Delete an SMB share. Requires explicit confirmation.",
      inputSchema: {
        id: z.number().describe("The numeric ID of the SMB share to delete."),
        confirm: z.boolean().describe("Must be true to confirm the delete operation."),
      },
    },
    async ({ id, confirm }): Promise<{ content: Array<{ type: "text"; text: string }> }> => {
      if (!confirm) {
        return { content: [{ type: "text", text: "Delete aborted: confirm must be true." }] };
      }
      try {
        const client = getTrueNASClient();
        await client.call("sharing.smb.delete", [id]);
        return { content: [{ type: "text", text: `SMB share ${id} deleted successfully.` }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );
}
