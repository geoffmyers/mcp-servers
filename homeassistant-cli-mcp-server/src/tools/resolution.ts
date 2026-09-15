import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { executeAuto, getServerConfig, formatErrorForMcp } from "@geoffmyers/mcp-server-shared";

export function registerResolutionTools(server: McpServer): void {
  const config = getServerConfig();

  server.tool(
    "resolution_info",
    "Get Resolution Center information (issues, suggestions, and unhealthy systems)",
    {},
    async (): Promise<CallToolResult> => {
      try {
        const result = await executeAuto(config, "ha", ["resolution", "info", "--raw-json"]);
        if (result.exitCode !== 0) {
          return { isError: true, content: [{ type: "text", text: `ha resolution info failed: ${result.stderr}` }] };
        }
        return { content: [{ type: "text", text: result.stdout }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.tool(
    "resolution_check",
    "Run a specific Resolution Center check by slug (get available slugs from resolution_info)",
    {
      slug: z.string().describe("Check slug to run (e.g. 'supervisor_trust')"),
    },
    async (args): Promise<CallToolResult> => {
      try {
        const result = await executeAuto(config, "ha", ["resolution", "check", "run", args.slug, "--raw-json"]);
        if (result.exitCode !== 0) {
          return { isError: true, content: [{ type: "text", text: `ha resolution check failed: ${result.stderr}` }] };
        }
        return { content: [{ type: "text", text: result.stdout || "Resolution check completed." }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );
}
