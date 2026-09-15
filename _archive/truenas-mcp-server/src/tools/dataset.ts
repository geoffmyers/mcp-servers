import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { getTrueNASClient } from "../lib/truenas-client.js";
import { formatErrorForMcp } from "../lib/errors.js";

export function registerDatasetTools(server: McpServer): void {
  server.registerTool(
    "list_datasets",
    {
      title: "List Datasets",
      description: "List all ZFS datasets on the TrueNAS system.",
      inputSchema: {},
    },
    async (): Promise<{ content: Array<{ type: "text"; text: string }> }> => {
      try {
        const client = getTrueNASClient();
        const result = await client.call("pool.dataset.query");
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.registerTool(
    "get_dataset",
    {
      title: "Get Dataset",
      description: "Get details of a specific ZFS dataset by its full path (e.g. 'pool/dataset').",
      inputSchema: {
        id: z.string().describe("The full path ID of the dataset (e.g. 'tank/data')."),
      },
    },
    async ({ id }): Promise<{ content: Array<{ type: "text"; text: string }> }> => {
      try {
        const client = getTrueNASClient();
        const result = await client.call("pool.dataset.get_instance", [id]);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.registerTool(
    "create_dataset",
    {
      title: "Create Dataset",
      description: "Create a new ZFS dataset.",
      inputSchema: {
        name: z.string().describe("Full path name for the dataset (e.g. 'tank/newdata')."),
        type: z.enum(["FILESYSTEM", "VOLUME"]).optional().describe("Dataset type. Defaults to FILESYSTEM."),
        comments: z.string().optional().describe("Optional comments for the dataset."),
        compression: z.string().optional().describe("Compression algorithm (e.g. 'lz4', 'gzip', 'zstd', 'off')."),
        quota: z.number().optional().describe("Quota in bytes (0 for no quota)."),
        refquota: z.number().optional().describe("Reference quota in bytes (0 for no refquota)."),
        atime: z.enum(["on", "off"]).optional().describe("Access time updates ('on' or 'off')."),
        exec: z.enum(["on", "off"]).optional().describe("Allow execution of binaries ('on' or 'off')."),
      },
    },
    async ({ name, type, comments, compression, quota, refquota, atime, exec }): Promise<{ content: Array<{ type: "text"; text: string }> }> => {
      try {
        const client = getTrueNASClient();
        const params: Record<string, unknown> = { name };
        if (type !== undefined) params.type = type;
        if (comments !== undefined) params.comments = comments;
        if (compression !== undefined) params.compression = compression;
        if (quota !== undefined) params.quota = quota;
        if (refquota !== undefined) params.refquota = refquota;
        if (atime !== undefined) params.atime = atime;
        if (exec !== undefined) params.exec = exec;

        const result = await client.callJob("pool.dataset.create", [params]);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.registerTool(
    "update_dataset",
    {
      title: "Update Dataset",
      description: "Update properties of an existing ZFS dataset.",
      inputSchema: {
        id: z.string().describe("The full path ID of the dataset to update (e.g. 'tank/data')."),
        comments: z.string().optional().describe("Updated comments for the dataset."),
        compression: z.string().optional().describe("Compression algorithm (e.g. 'lz4', 'gzip', 'zstd', 'off')."),
        quota: z.number().optional().describe("Quota in bytes (0 for no quota)."),
        refquota: z.number().optional().describe("Reference quota in bytes (0 for no refquota)."),
        atime: z.enum(["on", "off"]).optional().describe("Access time updates ('on' or 'off')."),
        exec: z.enum(["on", "off"]).optional().describe("Allow execution of binaries ('on' or 'off')."),
      },
    },
    async ({ id, comments, compression, quota, refquota, atime, exec }): Promise<{ content: Array<{ type: "text"; text: string }> }> => {
      try {
        const client = getTrueNASClient();
        const updates: Record<string, unknown> = {};
        if (comments !== undefined) updates.comments = comments;
        if (compression !== undefined) updates.compression = compression;
        if (quota !== undefined) updates.quota = quota;
        if (refquota !== undefined) updates.refquota = refquota;
        if (atime !== undefined) updates.atime = atime;
        if (exec !== undefined) updates.exec = exec;

        const result = await client.callJob("pool.dataset.update", [id, updates]);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.registerTool(
    "delete_dataset",
    {
      title: "Delete Dataset",
      description: "Delete a ZFS dataset. Requires explicit confirmation.",
      inputSchema: {
        id: z.string().describe("The full path ID of the dataset to delete (e.g. 'tank/data')."),
        confirm: z.boolean().describe("Must be true to confirm the delete operation."),
      },
    },
    async ({ id, confirm }): Promise<{ content: Array<{ type: "text"; text: string }> }> => {
      if (!confirm) {
        return { content: [{ type: "text", text: "Delete aborted: confirm must be true." }] };
      }
      try {
        const client = getTrueNASClient();
        await client.callJob("pool.dataset.delete", [id]);
        return { content: [{ type: "text", text: `Dataset '${id}' deleted successfully.` }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );
}
