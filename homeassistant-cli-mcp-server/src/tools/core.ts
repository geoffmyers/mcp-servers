import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { executeAuto, getServerConfig, formatErrorForMcp } from "@geoffmyers/mcp-server-shared";
import { isRestartDisconnect } from "./utils.js";

export function registerCoreTools(server: McpServer): void {
  const config = getServerConfig();

  server.tool(
    "core_info",
    "Get Home Assistant Core information (version, state, etc.)",
    {},
    async (): Promise<CallToolResult> => {
      try {
        const result = await executeAuto(config, "ha", ["core", "info", "--raw-json"]);
        if (result.exitCode !== 0) {
          return { isError: true, content: [{ type: "text", text: `ha core info failed: ${result.stderr}` }] };
        }
        return { content: [{ type: "text", text: result.stdout }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.tool(
    "core_stats",
    "Get Home Assistant Core resource usage statistics (CPU, memory)",
    {},
    async (): Promise<CallToolResult> => {
      try {
        const result = await executeAuto(config, "ha", ["core", "stats", "--raw-json"]);
        if (result.exitCode !== 0) {
          return { isError: true, content: [{ type: "text", text: `ha core stats failed: ${result.stderr}` }] };
        }
        return { content: [{ type: "text", text: result.stdout }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.tool(
    "core_restart",
    "Restart Home Assistant Core (requires confirm: true)",
    {
      confirm: z.boolean().describe("Must be true to execute this destructive operation"),
    },
    async (args): Promise<CallToolResult> => {
      if (!args.confirm) {
        return { isError: true, content: [{ type: "text", text: "Destructive operation: set confirm: true to restart Home Assistant Core." }] };
      }
      try {
        const result = await executeAuto(config, "ha", ["core", "restart", "--raw-json"]);
        if (result.exitCode !== 0) {
          if (isRestartDisconnect(result)) {
            return { content: [{ type: "text", text: "Home Assistant Core restart initiated." }] };
          }
          return { isError: true, content: [{ type: "text", text: `ha core restart failed: ${result.stderr}` }] };
        }
        return { content: [{ type: "text", text: result.stdout || "Home Assistant Core restart initiated." }] };
      } catch (error) {
        if (isRestartDisconnect(undefined, error)) {
          return { content: [{ type: "text", text: "Home Assistant Core restart initiated." }] };
        }
        return formatErrorForMcp(error);
      }
    }
  );

  server.tool(
    "core_update",
    "Update Home Assistant Core to the latest version (requires confirm: true)",
    {
      confirm: z.boolean().describe("Must be true to execute this destructive operation"),
    },
    async (args): Promise<CallToolResult> => {
      if (!args.confirm) {
        return { isError: true, content: [{ type: "text", text: "Destructive operation: set confirm: true to update Home Assistant Core." }] };
      }
      try {
        const result = await executeAuto(config, "ha", ["core", "update", "--raw-json"]);
        if (result.exitCode !== 0) {
          return { isError: true, content: [{ type: "text", text: `ha core update failed: ${result.stderr}` }] };
        }
        return { content: [{ type: "text", text: result.stdout || "Home Assistant Core update initiated." }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.tool(
    "core_check_config",
    "Validate the Home Assistant configuration",
    {},
    async (): Promise<CallToolResult> => {
      try {
        const result = await executeAuto(config, "ha", ["core", "check", "--raw-json"]);
        if (result.exitCode !== 0) {
          return { isError: true, content: [{ type: "text", text: `ha core check failed: ${result.stderr}` }] };
        }
        return { content: [{ type: "text", text: result.stdout || "Configuration is valid." }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );
}
