import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { executeAuto, getServerConfig, formatErrorForMcp } from "@geoffmyers/mcp-server-shared";

export function registerSystemTools(server: McpServer): void {
  const config = getServerConfig();

  server.tool(
    "system_info",
    "Get TrueNAS SCALE system information (hostname, version, uptime, etc.)",
    {},
    async (): Promise<CallToolResult> => {
      try {
        const result = await executeAuto(config, "midclt", ["call", "system.info"]);
        if (result.exitCode !== 0) {
          return { isError: true, content: [{ type: "text", text: `midclt call system.info failed: ${result.stderr}` }] };
        }
        return { content: [{ type: "text", text: result.stdout }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.tool(
    "system_reboot",
    "Reboot the TrueNAS SCALE system (requires confirm: true)",
    {
      confirm: z.boolean().describe("Must be true to execute this destructive operation"),
    },
    async (args): Promise<CallToolResult> => {
      if (!args.confirm) {
        return { isError: true, content: [{ type: "text", text: "Destructive operation: set confirm: true to reboot the system." }] };
      }
      try {
        const result = await executeAuto(config, "midclt", ["call", "system.reboot"]);
        if (result.exitCode !== 0) {
          return { isError: true, content: [{ type: "text", text: `midclt call system.reboot failed: ${result.stderr}` }] };
        }
        return { content: [{ type: "text", text: result.stdout || "System reboot initiated." }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.tool(
    "system_shutdown",
    "Shut down the TrueNAS SCALE system (requires confirm: true)",
    {
      confirm: z.boolean().describe("Must be true to execute this destructive operation"),
    },
    async (args): Promise<CallToolResult> => {
      if (!args.confirm) {
        return { isError: true, content: [{ type: "text", text: "Destructive operation: set confirm: true to shut down the system." }] };
      }
      try {
        const result = await executeAuto(config, "midclt", ["call", "system.shutdown"]);
        if (result.exitCode !== 0) {
          return { isError: true, content: [{ type: "text", text: `midclt call system.shutdown failed: ${result.stderr}` }] };
        }
        return { content: [{ type: "text", text: result.stdout || "System shutdown initiated." }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );
}
