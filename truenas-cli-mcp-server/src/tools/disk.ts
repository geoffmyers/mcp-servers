import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { executeAuto, getServerConfig, formatErrorForMcp } from "@geoffmyers/mcp-server-shared";

export function registerDiskTools(server: McpServer): void {
  const config = getServerConfig();

  server.tool(
    "list_disks",
    "List all disks in the system",
    {},
    async (): Promise<CallToolResult> => {
      try {
        const result = await executeAuto(config, "midclt", ["call", "disk.query"]);
        if (result.exitCode !== 0) {
          return { isError: true, content: [{ type: "text", text: `midclt call disk.query failed: ${result.stderr}` }] };
        }
        return { content: [{ type: "text", text: result.stdout }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.tool(
    "disk_smart_data",
    "Get SMART data for a disk",
    {
      disk_name: z.string().describe("Disk identifier (e.g. 'sda', 'nvme0n1')"),
    },
    async (args): Promise<CallToolResult> => {
      try {
        const result = await executeAuto(config, "midclt", ["call", "disk.smart_attributes", JSON.stringify(args.disk_name)]);
        if (result.exitCode !== 0) {
          return { isError: true, content: [{ type: "text", text: `midclt call disk.smart_attributes failed: ${result.stderr}` }] };
        }
        return { content: [{ type: "text", text: result.stdout }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.tool(
    "identify_disk",
    "Blink disk LED to physically identify a disk",
    {
      disk_name: z.string().describe("Disk identifier (e.g. 'sda', 'nvme0n1')"),
      seconds: z.number().optional().default(10).describe("Duration in seconds to blink the LED (default: 10)"),
    },
    async (args): Promise<CallToolResult> => {
      try {
        const result = await executeAuto(config, "midclt", ["call", "disk.identify", JSON.stringify(args.disk_name), String(args.seconds)]);
        if (result.exitCode !== 0) {
          return { isError: true, content: [{ type: "text", text: `midclt call disk.identify failed: ${result.stderr}` }] };
        }
        return { content: [{ type: "text", text: result.stdout || `Disk ${args.disk_name} LED blinking for ${args.seconds} seconds.` }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );
}
