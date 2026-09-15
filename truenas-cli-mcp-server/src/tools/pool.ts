import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { executeAuto, getServerConfig, formatErrorForMcp } from "@geoffmyers/mcp-server-shared";

export function registerPoolTools(server: McpServer): void {
  const config = getServerConfig();

  server.tool(
    "list_pools",
    "List all ZFS storage pools",
    {},
    async (): Promise<CallToolResult> => {
      try {
        const result = await executeAuto(config, "midclt", ["call", "pool.query"]);
        if (result.exitCode !== 0) {
          return { isError: true, content: [{ type: "text", text: `midclt call pool.query failed: ${result.stderr}` }] };
        }
        return { content: [{ type: "text", text: result.stdout }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.tool(
    "pool_status",
    "Get the status of a specific ZFS pool by name",
    {
      name: z.string().describe("Pool name (e.g. 'main', 'boot-pool')"),
    },
    async (args): Promise<CallToolResult> => {
      try {
        const filter = JSON.stringify([["name", "=", args.name]]);
        const result = await executeAuto(config, "midclt", ["call", "pool.query", filter]);
        if (result.exitCode !== 0) {
          return { isError: true, content: [{ type: "text", text: `midclt call pool.query failed: ${result.stderr}` }] };
        }
        return { content: [{ type: "text", text: result.stdout }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.tool(
    "start_scrub",
    "Start a pool scrub",
    {
      pool_name: z.string().describe("Pool name to scrub (e.g. 'SSD', 'HDD')"),
    },
    async (args): Promise<CallToolResult> => {
      try {
        const payload = JSON.stringify({ pool_name: args.pool_name });
        const result = await executeAuto(config, "midclt", ["call", "pool.scrub.create", payload]);
        if (result.exitCode !== 0) {
          return { isError: true, content: [{ type: "text", text: `midclt call pool.scrub.create failed: ${result.stderr}` }] };
        }
        return { content: [{ type: "text", text: result.stdout || `Scrub started on pool ${args.pool_name}.` }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.tool(
    "stop_scrub",
    "Stop a running pool scrub",
    {
      pool_name: z.string().describe("Pool name to stop scrubbing (e.g. 'SSD', 'HDD')"),
    },
    async (args): Promise<CallToolResult> => {
      try {
        const result = await executeAuto(config, "midclt", ["call", "pool.scrub.delete", JSON.stringify(args.pool_name)]);
        if (result.exitCode !== 0) {
          return { isError: true, content: [{ type: "text", text: `midclt call pool.scrub.delete failed: ${result.stderr}` }] };
        }
        return { content: [{ type: "text", text: result.stdout || `Scrub stopped on pool ${args.pool_name}.` }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.tool(
    "scrub_status",
    "Get scrub status for pools",
    {
      pool_name: z.string().optional().describe("Filter by pool name (returns all pools if omitted)"),
    },
    async (args): Promise<CallToolResult> => {
      try {
        const cmdArgs = ["call", "pool.scrub.query"];
        if (args.pool_name) {
          cmdArgs.push(JSON.stringify([["pool_name", "=", args.pool_name]]));
        }
        const result = await executeAuto(config, "midclt", cmdArgs);
        if (result.exitCode !== 0) {
          return { isError: true, content: [{ type: "text", text: `midclt call pool.scrub.query failed: ${result.stderr}` }] };
        }
        return { content: [{ type: "text", text: result.stdout }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );
}
