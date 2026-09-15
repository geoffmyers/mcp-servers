import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { getServerConfig, formatErrorForMcp } from "@geoffmyers/mcp-server-shared";
import { executeEsphome, executeInContainer } from "../lib/esphome.js";

export function registerDeviceTools(server: McpServer): void {
  const config = getServerConfig();
  const configDir = process.env.ESPHOME_CONFIG_DIR || "/config";

  server.tool(
    "list_devices",
    "List all ESPHome device configuration files",
    {},
    async (): Promise<CallToolResult> => {
      try {
        const result = await executeInContainer(config, ["ls", "-1", configDir]);
        if (result.exitCode !== 0) {
          return { isError: true, content: [{ type: "text", text: `Failed to list config directory: ${result.stderr}` }] };
        }
        const files = result.stdout
          .split("\n")
          .filter((f) => f.endsWith(".yaml") && f !== "secrets.yaml" && !f.startsWith("_"))
          .sort();
        if (files.length === 0) {
          return { content: [{ type: "text", text: "No ESPHome device configurations found." }] };
        }
        const devices = files.map((f) => f.replace(/\.yaml$/, ""));
        return { content: [{ type: "text", text: `ESPHome devices (${devices.length}):\n${devices.map((d) => `  - ${d}`).join("\n")}` }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.tool(
    "device_config",
    "Get the parsed configuration for an ESPHome device",
    {
      device: z.string().describe("Device name (without .yaml extension)"),
    },
    async (args): Promise<CallToolResult> => {
      try {
        const result = await executeEsphome(config, ["config", `${configDir}/${args.device}.yaml`]);
        if (result.exitCode !== 0) {
          return { isError: true, content: [{ type: "text", text: `esphome config failed: ${result.stderr}` }] };
        }
        return { content: [{ type: "text", text: result.stdout }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.tool(
    "device_logs",
    "View logs from an ESPHome device",
    {
      device: z.string().describe("Device name (without .yaml extension)"),
    },
    async (args): Promise<CallToolResult> => {
      try {
        const result = await executeEsphome(config, ["logs", `${configDir}/${args.device}.yaml`], {
          timeout: 60000,
          maxBuffer: 512 * 1024,
        });
        if (result.exitCode !== 0) {
          return { isError: true, content: [{ type: "text", text: `esphome logs failed: ${result.stderr}` }] };
        }
        const output = result.stdout || result.stderr;
        return { content: [{ type: "text", text: output || "No logs captured." }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );
}
