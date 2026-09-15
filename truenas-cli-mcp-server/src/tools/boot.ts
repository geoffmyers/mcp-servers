import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { executeAuto, getServerConfig, formatErrorForMcp } from "@geoffmyers/mcp-server-shared";

export function registerBootTools(server: McpServer): void {
  const config = getServerConfig();

  server.tool(
    "list_boot_envs",
    "List all boot environments",
    {},
    async (): Promise<CallToolResult> => {
      try {
        const result = await executeAuto(config, "midclt", ["call", "boot.environment.query"]);
        if (result.exitCode !== 0) {
          return { isError: true, content: [{ type: "text", text: `midclt call bootenv.query failed: ${result.stderr}` }] };
        }
        return { content: [{ type: "text", text: result.stdout }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );
}
