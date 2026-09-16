import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { executeAuto, getServerConfig, formatErrorForMcp } from "@geoffmyers/mcp-server-shared";
import { isRestartDisconnect } from "./utils.js";

export function registerHostTools(server: McpServer): void {
  const config = getServerConfig();

  server.tool(
    "host_info",
    "Get host system information (hostname, OS, kernel, etc.)",
    {},
    async (): Promise<CallToolResult> => {
      try {
        const result = await executeAuto(config, "ha", ["host", "info", "--raw-json"]);
        if (result.exitCode !== 0) {
          return { isError: true, content: [{ type: "text", text: `ha host info failed: ${result.stderr}` }] };
        }
        return { content: [{ type: "text", text: result.stdout }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.tool(
    "host_reboot",
    "Reboot the Home Assistant host (requires confirm: true)",
    {
      confirm: z.boolean().describe("Must be true to execute this destructive operation"),
    },
    async (args): Promise<CallToolResult> => {
      if (!args.confirm) {
        return { isError: true, content: [{ type: "text", text: "Destructive operation: set confirm: true to reboot the host." }] };
      }
      try {
        const result = await executeAuto(config, "ha", ["host", "reboot", "--raw-json"]);
        if (result.exitCode !== 0) {
          if (isRestartDisconnect(result)) {
            return { content: [{ type: "text", text: "Host reboot initiated." }] };
          }
          return { isError: true, content: [{ type: "text", text: `ha host reboot failed: ${result.stderr}` }] };
        }
        return { content: [{ type: "text", text: result.stdout || "Host reboot initiated." }] };
      } catch (error) {
        if (isRestartDisconnect(undefined, error)) {
          return { content: [{ type: "text", text: "Host reboot initiated." }] };
        }
        return formatErrorForMcp(error);
      }
    }
  );

  server.tool(
    "host_shutdown",
    "Shut down the Home Assistant host (requires confirm: true)",
    {
      confirm: z.boolean().describe("Must be true to execute this destructive operation"),
    },
    async (args): Promise<CallToolResult> => {
      if (!args.confirm) {
        return { isError: true, content: [{ type: "text", text: "Destructive operation: set confirm: true to shut down the host." }] };
      }
      try {
        const result = await executeAuto(config, "ha", ["host", "shutdown", "--raw-json"]);
        if (result.exitCode !== 0) {
          if (isRestartDisconnect(result)) {
            return { content: [{ type: "text", text: "Host shutdown initiated." }] };
          }
          return { isError: true, content: [{ type: "text", text: `ha host shutdown failed: ${result.stderr}` }] };
        }
        return { content: [{ type: "text", text: result.stdout || "Host shutdown initiated." }] };
      } catch (error) {
        if (isRestartDisconnect(undefined, error)) {
          return { content: [{ type: "text", text: "Host shutdown initiated." }] };
        }
        return formatErrorForMcp(error);
      }
    }
  );
}
