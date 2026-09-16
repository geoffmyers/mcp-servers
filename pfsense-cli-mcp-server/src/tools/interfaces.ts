import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { executeAuto, getServerConfig, formatErrorForMcp } from "@geoffmyers/mcp-server-shared";

export function registerInterfaceTools(server: McpServer): void {
  const config = getServerConfig();

  server.tool(
    "list_interfaces",
    "List all network interfaces (ifconfig -a)",
    {},
    async (): Promise<CallToolResult> => {
      try {
        const result = await executeAuto(config, "ifconfig", ["-a"], { maxBuffer: 256 * 1024 });
        if (result.exitCode !== 0) {
          return { isError: true, content: [{ type: "text", text: `ifconfig -a failed: ${result.stderr}` }] };
        }
        return { content: [{ type: "text", text: result.stdout }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.tool(
    "interface_status",
    "View interface statistics via pfctl (pfctl -sI)",
    {},
    async (): Promise<CallToolResult> => {
      try {
        const result = await executeAuto(config, "pfctl", ["-sI"]);
        if (result.exitCode !== 0) {
          return { isError: true, content: [{ type: "text", text: `pfctl -sI failed: ${result.stderr}` }] };
        }
        return { content: [{ type: "text", text: result.stdout }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.tool(
    "interface_stats",
    "Get detailed interface statistics via pfctl (pfctl -vvsI -i <interface>)",
    {
      interface: z.string().describe("Interface name (e.g. em0, igb0, vtnet0)"),
    },
    async (args): Promise<CallToolResult> => {
      try {
        const result = await executeAuto(config, "pfctl", ["-vvsI", "-i", args.interface]);
        if (result.exitCode !== 0) {
          return { isError: true, content: [{ type: "text", text: `pfctl -vvsI failed: ${result.stderr}` }] };
        }
        return { content: [{ type: "text", text: result.stdout || "No interface statistics found." }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );
}
