import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { executeAuto, getServerConfig, formatErrorForMcp } from "@geoffmyers/mcp-server-shared";

export function registerDatasetTools(server: McpServer): void {
  const config = getServerConfig();

  server.tool(
    "list_datasets",
    "List ZFS datasets. Use pool filter for large systems. Returns nested dataset trees.",
    {
      pool: z.string().optional().describe("Filter by pool name (e.g. 'SSD', 'HDD'). Recommended for large systems."),
      limit: z.number().optional().describe("Maximum number of datasets to return (default: 100)"),
      offset: z.number().optional().describe("Number of datasets to skip (for pagination)"),
    },
    async (args): Promise<CallToolResult> => {
      try {
        const cmdArgs = ["call", "pool.dataset.query"];
        const filter = args.pool ? JSON.stringify([["pool", "=", args.pool]]) : "[]";
        const options: Record<string, unknown> = {};
        if (args.limit !== undefined || args.offset !== undefined) {
          options.limit = args.limit ?? 100;
          if (args.offset !== undefined) options.offset = args.offset;
        } else {
          options.limit = 100;
        }
        cmdArgs.push(filter, JSON.stringify(options));
        const result = await executeAuto(config, "midclt", cmdArgs, { timeout: 60_000, maxBuffer: 10 * 1024 * 1024 });
        if (result.exitCode !== 0) {
          return { isError: true, content: [{ type: "text", text: `midclt call pool.dataset.query failed: ${result.stderr}` }] };
        }
        return { content: [{ type: "text", text: result.stdout }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.tool(
    "get_dataset",
    "Get details of a specific dataset by ID",
    {
      id: z.string().describe("Dataset ID (e.g. 'main/data', 'main/media')"),
    },
    async (args): Promise<CallToolResult> => {
      try {
        const filter = JSON.stringify([["id", "=", args.id]]);
        const result = await executeAuto(config, "midclt", ["call", "pool.dataset.query", filter]);
        if (result.exitCode !== 0) {
          return { isError: true, content: [{ type: "text", text: `midclt call pool.dataset.query failed: ${result.stderr}` }] };
        }
        return { content: [{ type: "text", text: result.stdout }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.tool(
    "create_dataset",
    "Create a new ZFS dataset",
    {
      name: z.string().describe("Full dataset name including pool (e.g. 'main/new-dataset')"),
    },
    async (args): Promise<CallToolResult> => {
      try {
        const payload = JSON.stringify({ name: args.name });
        const result = await executeAuto(config, "midclt", ["call", "pool.dataset.create", payload]);
        if (result.exitCode !== 0) {
          return { isError: true, content: [{ type: "text", text: `midclt call pool.dataset.create failed: ${result.stderr}` }] };
        }
        return { content: [{ type: "text", text: result.stdout || `Dataset ${args.name} created.` }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.tool(
    "delete_dataset",
    "Delete a ZFS dataset (requires confirm: true)",
    {
      id: z.string().describe("Dataset ID to delete (e.g. 'main/old-dataset')"),
      confirm: z.boolean().describe("Must be true to execute this destructive operation"),
    },
    async (args): Promise<CallToolResult> => {
      if (!args.confirm) {
        return { isError: true, content: [{ type: "text", text: "Destructive operation: set confirm: true to delete this dataset." }] };
      }
      try {
        const result = await executeAuto(config, "midclt", ["call", "pool.dataset.delete", args.id]);
        if (result.exitCode !== 0) {
          return { isError: true, content: [{ type: "text", text: `midclt call pool.dataset.delete failed: ${result.stderr}` }] };
        }
        return { content: [{ type: "text", text: result.stdout || `Dataset ${args.id} deleted.` }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.tool(
    "update_dataset",
    "Update dataset properties",
    {
      id: z.string().describe("Dataset ID (e.g. 'SSD/data')"),
      properties: z.object({
        compression: z.string().optional().describe("Compression algorithm (e.g. 'lz4', 'zstd', 'off')"),
        quota: z.number().optional().describe("Quota in bytes (0 to remove)"),
        refquota: z.number().optional().describe("Reference quota in bytes (0 to remove)"),
        atime: z.enum(["on", "off"]).optional().describe("Access time updates"),
        readonly: z.enum(["on", "off"]).optional().describe("Read-only mode"),
        recordsize: z.string().optional().describe("Record size (e.g. '128K', '1M')"),
        comments: z.string().optional().describe("Dataset comments"),
      }).describe("Properties to update"),
    },
    async (args): Promise<CallToolResult> => {
      try {
        const result = await executeAuto(config, "midclt", ["call", "pool.dataset.update", args.id, JSON.stringify(args.properties)]);
        if (result.exitCode !== 0) {
          return { isError: true, content: [{ type: "text", text: `midclt call pool.dataset.update failed: ${result.stderr}` }] };
        }
        return { content: [{ type: "text", text: result.stdout || `Dataset ${args.id} updated.` }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );
}
