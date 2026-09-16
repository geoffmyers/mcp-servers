import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { executeAuto, getServerConfig, formatErrorForMcp } from "@geoffmyers/mcp-server-shared";

export function registerAlertTools(server: McpServer): void {
  const config = getServerConfig();

  server.tool(
    "list_alerts",
    "List all active alerts",
    {},
    async (): Promise<CallToolResult> => {
      try {
        const result = await executeAuto(config, "midclt", ["call", "alert.list"]);
        if (result.exitCode !== 0) {
          return { isError: true, content: [{ type: "text", text: `midclt call alert.list failed: ${result.stderr}` }] };
        }
        return { content: [{ type: "text", text: result.stdout }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.tool(
    "dismiss_alert",
    "Dismiss an alert by ID",
    {
      id: z.string().describe("Alert UUID to dismiss"),
    },
    async (args): Promise<CallToolResult> => {
      try {
        const result = await executeAuto(config, "midclt", ["call", "alert.dismiss", args.id]);
        if (result.exitCode !== 0) {
          return { isError: true, content: [{ type: "text", text: `midclt call alert.dismiss failed: ${result.stderr}` }] };
        }
        return { content: [{ type: "text", text: result.stdout || `Alert ${args.id} dismissed.` }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );
}
