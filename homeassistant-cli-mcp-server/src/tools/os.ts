import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { executeAuto, getServerConfig, formatErrorForMcp } from "@geoffmyers/mcp-server-shared";

export function registerOsTools(server: McpServer): void {
  const config = getServerConfig();

  server.tool(
    "os_info",
    "Get Home Assistant OS information (version, board, boot slot, etc.)",
    {},
    async (): Promise<CallToolResult> => {
      try {
        const result = await executeAuto(config, "ha", ["os", "info", "--raw-json"]);
        if (result.exitCode !== 0) {
          return { isError: true, content: [{ type: "text", text: `ha os info failed: ${result.stderr}` }] };
        }
        return { content: [{ type: "text", text: result.stdout }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.tool(
    "os_update",
    "Update Home Assistant OS to the latest version (requires confirm: true)",
    {
      confirm: z.boolean().describe("Must be true to execute this destructive operation"),
    },
    async (args): Promise<CallToolResult> => {
      if (!args.confirm) {
        return { isError: true, content: [{ type: "text", text: "Destructive operation: set confirm: true to update Home Assistant OS." }] };
      }
      try {
        const result = await executeAuto(config, "ha", ["os", "update", "--raw-json"]);
        if (result.exitCode !== 0) {
          return { isError: true, content: [{ type: "text", text: `ha os update failed: ${result.stderr}` }] };
        }
        return { content: [{ type: "text", text: result.stdout || "Home Assistant OS update initiated." }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );
}
