import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { executeAuto, getServerConfig, formatErrorForMcp } from "@geoffmyers/mcp-server-shared";
import { executeEsphome } from "../lib/esphome.js";

export function registerManagementTools(server: McpServer): void {
  const config = getServerConfig();
  const configDir = process.env.ESPHOME_CONFIG_DIR || "/config";

  server.tool(
    "rename_device",
    "Rename an ESPHome device (requires confirm: true)",
    {
      device: z.string().describe("Current device name (YAML filename without extension)"),
      new_name: z.string().describe("New device name"),
      confirm: z.boolean().describe("Must be true to execute this operation"),
    },
    async (args): Promise<CallToolResult> => {
      if (!args.confirm) {
        return { isError: true, content: [{ type: "text", text: "Destructive operation: set confirm: true to rename this device." }] };
      }
      try {
        const deviceConfigPath = `${configDir}/${args.device}.yaml`;
        const result = await executeEsphome(config, ["rename", deviceConfigPath, args.new_name]);
        if (result.exitCode !== 0) {
          return { isError: true, content: [{ type: "text", text: `esphome rename failed: ${result.stderr}` }] };
        }
        return { content: [{ type: "text", text: result.stdout }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.tool(
    "discover_devices",
    "Discover ESPHome devices on the network via mDNS",
    {},
    async (): Promise<CallToolResult> => {
      try {
        const container = process.env.ESPHOME_CONTAINER || "esphome";
        const result = await executeAuto(config, "docker", [
          "exec", container, "sh", "-c",
          `esphome discover $(ls ${configDir}/[!_]*.yaml 2>/dev/null | head -1)`,
        ], {
          timeout: 30_000,
        });
        if (result.exitCode !== 0) {
          return { isError: true, content: [{ type: "text", text: `esphome discover failed: ${result.stderr}` }] };
        }
        return { content: [{ type: "text", text: result.stdout }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );
}
