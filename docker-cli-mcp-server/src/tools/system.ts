import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { executeAuto, getServerConfig, formatErrorForMcp } from "@geoffmyers/mcp-server-shared";

export function registerSystemTools(server: McpServer): void {
  const config = getServerConfig();

  server.tool(
    "system_info",
    "Get Docker system information",
    {},
    async (): Promise<CallToolResult> => {
      try {
        const result = await executeAuto(config, "docker", ["system", "info"]);
        if (result.exitCode !== 0) {
          return { isError: true, content: [{ type: "text", text: `docker system info failed: ${result.stderr}` }] };
        }
        return { content: [{ type: "text", text: result.stdout }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.tool(
    "system_prune",
    "Remove unused Docker data (containers, images, networks) (requires confirm: true)",
    {
      all: z.boolean().optional().default(false).describe("Remove all unused images, not just dangling ones"),
      volumes: z.boolean().optional().default(false).describe("Also prune volumes"),
      confirm: z.boolean().describe("Must be true to execute this destructive operation"),
    },
    async (args): Promise<CallToolResult> => {
      if (!args.confirm) {
        return { isError: true, content: [{ type: "text", text: "Destructive operation: set confirm: true to prune Docker system." }] };
      }
      try {
        const dockerArgs = ["system", "prune", "-f"];
        if (args.all) dockerArgs.push("-a");
        if (args.volumes) dockerArgs.push("--volumes");

        const result = await executeAuto(config, "docker", dockerArgs);
        if (result.exitCode !== 0) {
          return { isError: true, content: [{ type: "text", text: `docker system prune failed: ${result.stderr}` }] };
        }
        return { content: [{ type: "text", text: result.stdout || "System pruned." }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );
}
