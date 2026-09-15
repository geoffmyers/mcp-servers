import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { getServerConfig, formatErrorForMcp } from "@geoffmyers/mcp-server-shared";
import { executeEsphome } from "../lib/esphome.js";

export function registerBuildTools(server: McpServer): void {
  const config = getServerConfig();
  const configDir = process.env.ESPHOME_CONFIG_DIR || "/config";

  server.tool(
    "compile_device",
    "Compile firmware for an ESPHome device",
    {
      device: z.string().describe("Device name (without .yaml extension)"),
    },
    async (args): Promise<CallToolResult> => {
      try {
        const result = await executeEsphome(config, ["compile", `${configDir}/${args.device}.yaml`], {
          timeout: 1500000,
          maxBuffer: 50 * 1024 * 1024,
        });
        if (result.exitCode !== 0) {
          return { isError: true, content: [{ type: "text", text: `esphome compile failed: ${result.stderr}` }] };
        }
        return { content: [{ type: "text", text: result.stdout }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.tool(
    "upload_device",
    "Upload (run) firmware to an ESPHome device (requires confirm: true)",
    {
      device: z.string().describe("Device name (without .yaml extension)"),
      confirm: z.boolean().describe("Must be true to execute this operation"),
    },
    async (args): Promise<CallToolResult> => {
      if (!args.confirm) {
        return { isError: true, content: [{ type: "text", text: "Destructive operation: set confirm: true to upload firmware to this device." }] };
      }
      try {
        const result = await executeEsphome(config, ["run", "--no-logs", `${configDir}/${args.device}.yaml`], {
          timeout: 1500000,
          maxBuffer: 50 * 1024 * 1024,
        });
        if (result.exitCode !== 0) {
          return { isError: true, content: [{ type: "text", text: `esphome run failed: ${result.stderr}` }] };
        }
        return { content: [{ type: "text", text: result.stdout }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.tool(
    "clean_build",
    "Clean build files for an ESPHome device (requires confirm: true)",
    {
      device: z.string().describe("Device name (without .yaml extension)"),
      confirm: z.boolean().describe("Must be true to execute this destructive operation"),
    },
    async (args): Promise<CallToolResult> => {
      if (!args.confirm) {
        return { isError: true, content: [{ type: "text", text: "Destructive operation: set confirm: true to clean build files for this device." }] };
      }
      try {
        const result = await executeEsphome(config, ["clean", `${configDir}/${args.device}.yaml`]);
        if (result.exitCode !== 0) {
          return { isError: true, content: [{ type: "text", text: `esphome clean failed: ${result.stderr}` }] };
        }
        return { content: [{ type: "text", text: `Build files cleaned for device ${args.device}.` }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );
}
