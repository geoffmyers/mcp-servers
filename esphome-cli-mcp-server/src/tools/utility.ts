import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { getServerConfig, formatErrorForMcp } from "@geoffmyers/mcp-server-shared";
import { executeEsphome } from "../lib/esphome.js";

export function registerUtilityTools(server: McpServer): void {
  const config = getServerConfig();
  const configDir = process.env.ESPHOME_CONFIG_DIR || "/config";

  server.tool(
    "validate_config",
    "Validate an ESPHome device configuration file",
    {
      device: z.string().describe("Device name (without .yaml extension)"),
    },
    async (args): Promise<CallToolResult> => {
      try {
        const result = await executeEsphome(config, ["config", `${configDir}/${args.device}.yaml`]);
        if (result.exitCode !== 0) {
          return { isError: true, content: [{ type: "text", text: `Configuration validation failed:\n${result.stderr}` }] };
        }
        return { content: [{ type: "text", text: `Configuration for ${args.device} is valid.\n\n${result.stdout}` }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.tool(
    "version",
    "Get the ESPHome version",
    {},
    async (): Promise<CallToolResult> => {
      try {
        const result = await executeEsphome(config, ["version"]);
        if (result.exitCode !== 0) {
          return { isError: true, content: [{ type: "text", text: `esphome version failed: ${result.stderr}` }] };
        }
        return { content: [{ type: "text", text: result.stdout.trim() }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );
}
