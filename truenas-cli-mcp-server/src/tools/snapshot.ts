import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { executeAuto, getServerConfig, formatErrorForMcp } from "@geoffmyers/mcp-server-shared";

export function registerSnapshotTools(server: McpServer): void {
  const config = getServerConfig();

  server.tool(
    "list_snapshots",
    "List ZFS snapshots. Use dataset or pool filter to avoid timeouts on systems with many snapshots. Use count_only to get total count.",
    {
      dataset: z.string().optional().describe("Filter by exact dataset name (e.g. 'SSD/Users'). Recommended for large systems."),
      pool: z.string().optional().describe("Filter by pool name prefix (e.g. 'SSD' returns all SSD/* snapshots). Alternative to dataset."),
      limit: z.number().optional().describe("Maximum number of snapshots to return (default: 100)"),
      offset: z.number().optional().describe("Number of snapshots to skip (for pagination)"),
      count_only: z.boolean().optional().describe("If true, return only the total count of matching snapshots"),
    },
    async (args): Promise<CallToolResult> => {
      try {
        const cmdArgs = ["call", "zfs.snapshot.query"];
        const filters: unknown[] = [];
        if (args.dataset) {
          filters.push(["dataset", "=", args.dataset]);
        } else if (args.pool) {
          filters.push(["dataset", "^", args.pool]);
        }
        const options: Record<string, unknown> = {};
        if (args.count_only) {
          options.count = true;
        } else {
          options.limit = args.limit ?? 100;
          if (args.offset !== undefined) options.offset = args.offset;
          options.select = ["id", "dataset", "snapshot_name", "properties"];
        }
        cmdArgs.push(JSON.stringify(filters), JSON.stringify(options));
        const result = await executeAuto(config, "midclt", cmdArgs, { timeout: 120_000, maxBuffer: 10 * 1024 * 1024 });
        if (result.exitCode !== 0) {
          return { isError: true, content: [{ type: "text", text: `midclt call zfs.snapshot.query failed: ${result.stderr}` }] };
        }
        if (args.count_only) {
          return { content: [{ type: "text", text: `Total snapshots matching filter: ${result.stdout.trim()}` }] };
        }
        return { content: [{ type: "text", text: result.stdout }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.tool(
    "create_snapshot",
    "Create a ZFS snapshot",
    {
      dataset: z.string().describe("Dataset to snapshot (e.g. 'main/data')"),
      name: z.string().describe("Snapshot name (e.g. 'backup-2024-01-01')"),
    },
    async (args): Promise<CallToolResult> => {
      try {
        const payload = JSON.stringify({ dataset: args.dataset, name: args.name });
        const result = await executeAuto(config, "midclt", ["call", "zfs.snapshot.create", payload]);
        if (result.exitCode !== 0) {
          return { isError: true, content: [{ type: "text", text: `midclt call zfs.snapshot.create failed: ${result.stderr}` }] };
        }
        return { content: [{ type: "text", text: result.stdout || `Snapshot ${args.dataset}@${args.name} created.` }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.tool(
    "delete_snapshot",
    "Delete a ZFS snapshot (requires confirm: true)",
    {
      id: z.string().describe("Snapshot ID (e.g. 'main/data@backup-2024-01-01')"),
      confirm: z.boolean().describe("Must be true to execute this destructive operation"),
    },
    async (args): Promise<CallToolResult> => {
      if (!args.confirm) {
        return { isError: true, content: [{ type: "text", text: "Destructive operation: set confirm: true to delete this snapshot." }] };
      }
      try {
        const result = await executeAuto(config, "midclt", ["call", "zfs.snapshot.delete", args.id]);
        if (result.exitCode !== 0) {
          return { isError: true, content: [{ type: "text", text: `midclt call zfs.snapshot.delete failed: ${result.stderr}` }] };
        }
        return { content: [{ type: "text", text: result.stdout || `Snapshot ${args.id} deleted.` }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.tool(
    "rollback_snapshot",
    "Rollback a dataset to a ZFS snapshot (requires confirm: true)",
    {
      id: z.string().describe("Snapshot ID to rollback to (e.g. 'main/data@backup-2024-01-01')"),
      confirm: z.boolean().describe("Must be true to execute this destructive operation"),
    },
    async (args): Promise<CallToolResult> => {
      if (!args.confirm) {
        return { isError: true, content: [{ type: "text", text: "Destructive operation: set confirm: true to rollback to this snapshot." }] };
      }
      try {
        const result = await executeAuto(config, "midclt", ["call", "zfs.snapshot.rollback", args.id]);
        if (result.exitCode !== 0) {
          return { isError: true, content: [{ type: "text", text: `midclt call zfs.snapshot.rollback failed: ${result.stderr}` }] };
        }
        return { content: [{ type: "text", text: result.stdout || `Rolled back to snapshot ${args.id}.` }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );
}
