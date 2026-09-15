import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { getTrueNASClient } from "../lib/truenas-client.js";
import { formatErrorForMcp } from "../lib/errors.js";

export function registerNfsTools(server: McpServer): void {
  server.registerTool(
    "list_nfs_exports",
    {
      title: "List NFS Exports",
      description: "List all NFS exports on the TrueNAS system.",
      inputSchema: {},
    },
    async (): Promise<{ content: Array<{ type: "text"; text: string }> }> => {
      try {
        const client = getTrueNASClient();
        const result = await client.call("sharing.nfs.query");
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.registerTool(
    "create_nfs_export",
    {
      title: "Create NFS Export",
      description: "Create a new NFS export.",
      inputSchema: {
        path: z.string().describe("The filesystem path to export (e.g. '/mnt/tank/data')."),
        comment: z.string().optional().describe("Optional description of the export."),
        networks: z.array(z.string()).optional().describe("Allowed networks in CIDR notation (e.g. ['192.168.1.0/24'])."),
        hosts: z.array(z.string()).optional().describe("Allowed hostnames or IP addresses."),
        ro: z.boolean().optional().describe("Set the export as read-only."),
        maproot_user: z.string().optional().describe("Map root user to this user."),
        maproot_group: z.string().optional().describe("Map root group to this group."),
      },
    },
    async ({ path, comment, networks, hosts, ro, maproot_user, maproot_group }): Promise<{ content: Array<{ type: "text"; text: string }> }> => {
      try {
        const client = getTrueNASClient();
        const params: Record<string, unknown> = { path };
        if (comment !== undefined) params.comment = comment;
        if (networks !== undefined) params.networks = networks;
        if (hosts !== undefined) params.hosts = hosts;
        if (ro !== undefined) params.ro = ro;
        if (maproot_user !== undefined) params.maproot_user = maproot_user;
        if (maproot_group !== undefined) params.maproot_group = maproot_group;

        const result = await client.call("sharing.nfs.create", [params]);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.registerTool(
    "delete_nfs_export",
    {
      title: "Delete NFS Export",
      description: "Delete an NFS export. Requires explicit confirmation.",
      inputSchema: {
        id: z.number().describe("The numeric ID of the NFS export to delete."),
        confirm: z.boolean().describe("Must be true to confirm the delete operation."),
      },
    },
    async ({ id, confirm }): Promise<{ content: Array<{ type: "text"; text: string }> }> => {
      if (!confirm) {
        return { content: [{ type: "text", text: "Delete aborted: confirm must be true." }] };
      }
      try {
        const client = getTrueNASClient();
        await client.call("sharing.nfs.delete", [id]);
        return { content: [{ type: "text", text: `NFS export ${id} deleted successfully.` }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );
}
