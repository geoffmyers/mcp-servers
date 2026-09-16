import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { getTrueNASClient } from "../lib/truenas-client.js";
import { formatErrorForMcp } from "../lib/errors.js";

export function registerIscsiTools(server: McpServer): void {
  server.registerTool(
    "list_iscsi_targets",
    {
      title: "List iSCSI Targets",
      description: "List all iSCSI targets on the TrueNAS system.",
      inputSchema: {},
    },
    async (): Promise<{ content: Array<{ type: "text"; text: string }> }> => {
      try {
        const client = getTrueNASClient();
        const result = await client.call("iscsi.target.query");
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.registerTool(
    "create_iscsi_target",
    {
      title: "Create iSCSI Target",
      description: "Create a new iSCSI target.",
      inputSchema: {
        name: z.string().describe("The name of the iSCSI target."),
        alias: z.string().optional().describe("Optional alias for the target."),
      },
    },
    async ({ name, alias }): Promise<{ content: Array<{ type: "text"; text: string }> }> => {
      try {
        const client = getTrueNASClient();
        const params: Record<string, unknown> = { name };
        if (alias !== undefined) params.alias = alias;

        const result = await client.call("iscsi.target.create", [params]);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.registerTool(
    "list_iscsi_extents",
    {
      title: "List iSCSI Extents",
      description: "List all iSCSI extents on the TrueNAS system.",
      inputSchema: {},
    },
    async (): Promise<{ content: Array<{ type: "text"; text: string }> }> => {
      try {
        const client = getTrueNASClient();
        const result = await client.call("iscsi.extent.query");
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.registerTool(
    "create_iscsi_extent",
    {
      title: "Create iSCSI Extent",
      description: "Create a new iSCSI extent (backing storage for a target).",
      inputSchema: {
        name: z.string().describe("The name of the iSCSI extent."),
        type: z.enum(["DISK", "FILE"]).describe("The extent type: DISK or FILE."),
        disk: z.string().optional().describe("The disk path (required when type is DISK, e.g. 'zvol/tank/iscsi/disk0')."),
        path: z.string().optional().describe("The file path (required when type is FILE)."),
        filesize: z.number().optional().describe("The file size in bytes (used when type is FILE)."),
      },
    },
    async ({ name, type, disk, path, filesize }): Promise<{ content: Array<{ type: "text"; text: string }> }> => {
      try {
        const client = getTrueNASClient();
        const params: Record<string, unknown> = { name, type };
        if (disk !== undefined) params.disk = disk;
        if (path !== undefined) params.path = path;
        if (filesize !== undefined) params.filesize = filesize;

        const result = await client.call("iscsi.extent.create", [params]);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );
}
