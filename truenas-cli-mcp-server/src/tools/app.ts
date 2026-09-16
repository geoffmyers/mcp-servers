import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { executeAuto, getServerConfig, formatErrorForMcp } from "@geoffmyers/mcp-server-shared";

export function registerAppTools(server: McpServer): void {
  const config = getServerConfig();

  server.tool(
    "list_apps",
    "List all installed apps",
    {},
    async (): Promise<CallToolResult> => {
      try {
        const result = await executeAuto(config, "midclt", ["call", "app.query"]);
        if (result.exitCode !== 0) {
          return { isError: true, content: [{ type: "text", text: `midclt call app.query failed: ${result.stderr}` }] };
        }
        return { content: [{ type: "text", text: result.stdout }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.tool(
    "start_app",
    "Start an installed app",
    {
      name: z.string().describe("App name"),
    },
    async (args): Promise<CallToolResult> => {
      try {
        const result = await executeAuto(config, "midclt", ["call", "app.start", args.name]);
        if (result.exitCode !== 0) {
          return { isError: true, content: [{ type: "text", text: `midclt call app.start failed: ${result.stderr}` }] };
        }
        return { content: [{ type: "text", text: result.stdout || `App ${args.name} started.` }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.tool(
    "stop_app",
    "Stop a running app",
    {
      name: z.string().describe("App name"),
    },
    async (args): Promise<CallToolResult> => {
      try {
        const result = await executeAuto(config, "midclt", ["call", "app.stop", args.name]);
        if (result.exitCode !== 0) {
          return { isError: true, content: [{ type: "text", text: `midclt call app.stop failed: ${result.stderr}` }] };
        }
        return { content: [{ type: "text", text: result.stdout || `App ${args.name} stopped.` }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );
}
