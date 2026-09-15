import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { getTrueNASClient } from "../lib/truenas-client.js";
import { formatErrorForMcp } from "../lib/errors.js";

export function registerAppTools(server: McpServer): void {
  server.registerTool(
    "list_apps",
    {
      title: "List Apps",
      description: "List all installed applications on the TrueNAS system.",
      inputSchema: {},
    },
    async (): Promise<{ content: Array<{ type: "text"; text: string }> }> => {
      try {
        const client = getTrueNASClient();
        const result = await client.call("app.query");
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.registerTool(
    "start_app",
    {
      title: "Start App",
      description: "Start an installed application by name.",
      inputSchema: {
        name: z.string().describe("The name of the application to start."),
      },
    },
    async ({ name }): Promise<{ content: Array<{ type: "text"; text: string }> }> => {
      try {
        const client = getTrueNASClient();
        const result = await client.callJob("app.start", [name]);
        return { content: [{ type: "text", text: `App '${name}' started successfully.\n${JSON.stringify(result, null, 2)}` }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.registerTool(
    "stop_app",
    {
      title: "Stop App",
      description: "Stop a running application by name.",
      inputSchema: {
        name: z.string().describe("The name of the application to stop."),
      },
    },
    async ({ name }): Promise<{ content: Array<{ type: "text"; text: string }> }> => {
      try {
        const client = getTrueNASClient();
        const result = await client.callJob("app.stop", [name]);
        return { content: [{ type: "text", text: `App '${name}' stopped successfully.\n${JSON.stringify(result, null, 2)}` }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.registerTool(
    "upgrade_app",
    {
      title: "Upgrade App",
      description: "Upgrade an installed application to the latest version.",
      inputSchema: {
        name: z.string().describe("The name of the application to upgrade."),
      },
    },
    async ({ name }): Promise<{ content: Array<{ type: "text"; text: string }> }> => {
      try {
        const client = getTrueNASClient();
        const result = await client.callJob("app.upgrade", [name]);
        return { content: [{ type: "text", text: `App '${name}' upgraded successfully.\n${JSON.stringify(result, null, 2)}` }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );
}
