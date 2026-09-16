import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { executeAuto, getServerConfig, formatErrorForMcp } from "@geoffmyers/mcp-server-shared";

export function registerSupervisorTools(server: McpServer): void {
  const config = getServerConfig();

  server.tool(
    "supervisor_info",
    "Get Supervisor information (version, state, add-on count, etc.)",
    {},
    async (): Promise<CallToolResult> => {
      try {
        const result = await executeAuto(config, "ha", ["supervisor", "info", "--raw-json"]);
        if (result.exitCode !== 0) {
          return { isError: true, content: [{ type: "text", text: `ha supervisor info failed: ${result.stderr}` }] };
        }
        return { content: [{ type: "text", text: result.stdout }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.tool(
    "supervisor_logs",
    "View Supervisor logs",
    {},
    async (): Promise<CallToolResult> => {
      try {
        const result = await executeAuto(config, "ha", ["supervisor", "logs"], { maxBuffer: 512 * 1024 });
        if (result.exitCode !== 0) {
          return { isError: true, content: [{ type: "text", text: `ha supervisor logs failed: ${result.stderr}` }] };
        }
        const output = result.stdout || result.stderr;
        return { content: [{ type: "text", text: output || "No logs found." }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.tool(
    "supervisor_update",
    "Update the Supervisor to the latest version (requires confirm: true)",
    {
      confirm: z.boolean().describe("Must be true to execute this destructive operation"),
    },
    async (args): Promise<CallToolResult> => {
      if (!args.confirm) {
        return { isError: true, content: [{ type: "text", text: "Destructive operation: set confirm: true to update the Supervisor." }] };
      }
      try {
        const result = await executeAuto(config, "ha", ["supervisor", "update", "--raw-json"]);
        if (result.exitCode !== 0) {
          return { isError: true, content: [{ type: "text", text: `ha supervisor update failed: ${result.stderr}` }] };
        }
        return { content: [{ type: "text", text: result.stdout || "Supervisor update initiated." }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );
}
