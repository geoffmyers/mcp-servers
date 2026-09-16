import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { getTrueNASClient } from "../lib/truenas-client.js";
import { formatErrorForMcp } from "../lib/errors.js";

export function registerSnapshotTools(server: McpServer): void {
  server.registerTool(
    "list_snapshots",
    {
      title: "List Snapshots",
      description: "List all ZFS snapshots on the TrueNAS system.",
      inputSchema: {},
    },
    async (): Promise<{ content: Array<{ type: "text"; text: string }> }> => {
      try {
        const client = getTrueNASClient();
        const result = await client.call("zfs.snapshot.query");
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.registerTool(
    "create_snapshot",
    {
      title: "Create Snapshot",
      description: "Create a new ZFS snapshot of a dataset.",
      inputSchema: {
        dataset: z.string().describe("The dataset to snapshot (e.g. 'tank/data')."),
        name: z.string().describe("Name for the snapshot."),
        recursive: z.boolean().optional().describe("Recursively snapshot child datasets."),
      },
    },
    async ({ dataset, name, recursive }): Promise<{ content: Array<{ type: "text"; text: string }> }> => {
      try {
        const client = getTrueNASClient();
        const params: Record<string, unknown> = { dataset, name };
        if (recursive !== undefined) params.recursive = recursive;

        const result = await client.callJob("zfs.snapshot.create", [params]);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.registerTool(
    "delete_snapshot",
    {
      title: "Delete Snapshot",
      description: "Delete a ZFS snapshot. Requires explicit confirmation.",
      inputSchema: {
        id: z.string().describe("The full snapshot ID (e.g. 'tank/data@snap1')."),
        confirm: z.boolean().describe("Must be true to confirm the delete operation."),
      },
    },
    async ({ id, confirm }): Promise<{ content: Array<{ type: "text"; text: string }> }> => {
      if (!confirm) {
        return { content: [{ type: "text", text: "Delete aborted: confirm must be true." }] };
      }
      try {
        const client = getTrueNASClient();
        await client.call("zfs.snapshot.delete", [id]);
        return { content: [{ type: "text", text: `Snapshot '${id}' deleted successfully.` }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.registerTool(
    "rollback_snapshot",
    {
      title: "Rollback Snapshot",
      description: "Rollback a dataset to a ZFS snapshot. This is destructive and requires explicit confirmation.",
      inputSchema: {
        id: z.string().describe("The full snapshot ID to rollback to (e.g. 'tank/data@snap1')."),
        confirm: z.boolean().describe("Must be true to confirm the rollback operation."),
        force: z.boolean().optional().describe("Force rollback even if it means destroying more recent snapshots."),
        recursive: z.boolean().optional().describe("Destroy any snapshots and bookmarks more recent than the target."),
        recursive_clones: z.boolean().optional().describe("Also destroy clones of more recent snapshots."),
      },
    },
    async ({ id, confirm, force, recursive, recursive_clones }): Promise<{ content: Array<{ type: "text"; text: string }> }> => {
      if (!confirm) {
        return { content: [{ type: "text", text: "Rollback aborted: confirm must be true." }] };
      }
      try {
        const client = getTrueNASClient();
        const options: Record<string, unknown> = {};
        if (force !== undefined) options.force = force;
        if (recursive !== undefined) options.recursive = recursive;
        if (recursive_clones !== undefined) options.recursive_clones = recursive_clones;

        await client.callJob("zfs.snapshot.rollback", [id, options]);
        return { content: [{ type: "text", text: `Snapshot '${id}' rolled back successfully.` }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.registerTool(
    "clone_snapshot",
    {
      title: "Clone Snapshot",
      description: "Clone a ZFS snapshot into a new dataset.",
      inputSchema: {
        snapshot: z.string().describe("The full snapshot ID to clone (e.g. 'tank/data@snap1')."),
        dataset_dst: z.string().describe("Destination dataset path for the clone (e.g. 'tank/clone1')."),
      },
    },
    async ({ snapshot, dataset_dst }): Promise<{ content: Array<{ type: "text"; text: string }> }> => {
      try {
        const client = getTrueNASClient();
        const result = await client.call("zfs.snapshot.clone", [{ snapshot, dataset_dst }]);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );
}
