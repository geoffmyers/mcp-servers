import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { getServerConfig, formatErrorForMcp } from "@geoffmyers/mcp-server-shared";
import { mongoQuery } from "../lib/mongo.js";

const MAC_REGEX = /^([0-9a-fA-F]{2}:){5}[0-9a-fA-F]{2}$/;

export function registerDeviceTools(server: McpServer): void {
  const config = getServerConfig();

  server.tool(
    "list_devices",
    "List all adopted UniFi devices (APs, switches, gateways)",
    {},
    async (): Promise<CallToolResult> => {
      try {
        const result = await mongoQuery(
          config,
          'db.device.find({}).forEach(printjson)',
          { maxBuffer: 1024 * 1024 }
        );
        if (result.exitCode !== 0) {
          return { isError: true, content: [{ type: "text", text: `MongoDB query failed: ${result.stderr}` }] };
        }
        return { content: [{ type: "text", text: result.stdout || "No devices found." }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.tool(
    "device_info",
    "Get detailed information about a specific UniFi device by MAC address",
    {
      mac: z.string().regex(MAC_REGEX).describe("Device MAC address (e.g. aa:bb:cc:dd:ee:ff)"),
    },
    async (args): Promise<CallToolResult> => {
      try {
        const result = await mongoQuery(
          config,
          `db.device.find({mac:"${args.mac.toLowerCase()}"}).forEach(printjson)`
        );
        if (result.exitCode !== 0) {
          return { isError: true, content: [{ type: "text", text: `MongoDB query failed: ${result.stderr}` }] };
        }
        return { content: [{ type: "text", text: result.stdout || "No device found with that MAC address." }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.tool(
    "device_uptime",
    "Get device uptime and last-seen timestamps by MAC address",
    {
      mac: z.string().regex(MAC_REGEX).describe("Device MAC address (e.g. aa:bb:cc:dd:ee:ff)"),
    },
    async (args): Promise<CallToolResult> => {
      try {
        const result = await mongoQuery(
          config,
          `db.device.find({mac:"${args.mac.toLowerCase()}"}).forEach(printjson)`
        );
        if (result.exitCode !== 0) {
          return { isError: true, content: [{ type: "text", text: `MongoDB query failed: ${result.stderr}` }] };
        }
        return { content: [{ type: "text", text: result.stdout || "No device found with that MAC address." }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );
}
