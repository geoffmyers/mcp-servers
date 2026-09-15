import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { getTrueNASClient } from "../lib/truenas-client.js";
import { formatErrorForMcp } from "../lib/errors.js";

export function registerSystemTools(server: McpServer): void {
  server.registerTool(
    "get_system_info",
    {
      title: "Get System Info",
      description: "Retrieve TrueNAS system information including version, hostname, uptime, and hardware details.",
      inputSchema: {},
    },
    async (): Promise<{ content: Array<{ type: "text"; text: string }> }> => {
      try {
        const client = getTrueNASClient();
        const result = await client.call("system.info");
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.registerTool(
    "reboot_system",
    {
      title: "Reboot System",
      description: "Reboot the TrueNAS system. Requires explicit confirmation.",
      inputSchema: {
        confirm: z.boolean().describe("Must be true to confirm the reboot operation."),
      },
    },
    async ({ confirm }): Promise<{ content: Array<{ type: "text"; text: string }> }> => {
      if (!confirm) {
        return { content: [{ type: "text", text: "Reboot aborted: confirm must be true." }] };
      }
      try {
        const client = getTrueNASClient();
        await client.callJob("system.reboot");
        return { content: [{ type: "text", text: "System reboot initiated." }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.registerTool(
    "shutdown_system",
    {
      title: "Shutdown System",
      description: "Shut down the TrueNAS system. Requires explicit confirmation.",
      inputSchema: {
        confirm: z.boolean().describe("Must be true to confirm the shutdown operation."),
      },
    },
    async ({ confirm }): Promise<{ content: Array<{ type: "text"; text: string }> }> => {
      if (!confirm) {
        return { content: [{ type: "text", text: "Shutdown aborted: confirm must be true." }] };
      }
      try {
        const client = getTrueNASClient();
        await client.callJob("system.shutdown");
        return { content: [{ type: "text", text: "System shutdown initiated." }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );
}
