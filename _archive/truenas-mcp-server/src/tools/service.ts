import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { getTrueNASClient } from "../lib/truenas-client.js";
import { formatErrorForMcp } from "../lib/errors.js";

export function registerServiceTools(server: McpServer): void {
  server.registerTool(
    "list_services",
    {
      title: "List Services",
      description: "List all services and their current status on the TrueNAS system.",
      inputSchema: {},
    },
    async (): Promise<{ content: Array<{ type: "text"; text: string }> }> => {
      try {
        const client = getTrueNASClient();
        const result = await client.call("service.query");
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.registerTool(
    "start_service",
    {
      title: "Start Service",
      description: "Start a TrueNAS service by name.",
      inputSchema: {
        name: z.string().describe("The service name (e.g. 'cifs', 'nfs', 'ssh', 'smartd')."),
      },
    },
    async ({ name }): Promise<{ content: Array<{ type: "text"; text: string }> }> => {
      try {
        const client = getTrueNASClient();
        const result = await client.call("service.start", [name, { silent: false }]);
        return { content: [{ type: "text", text: `Service '${name}' start result: ${JSON.stringify(result)}` }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.registerTool(
    "stop_service",
    {
      title: "Stop Service",
      description: "Stop a TrueNAS service by name.",
      inputSchema: {
        name: z.string().describe("The service name (e.g. 'cifs', 'nfs', 'ssh', 'smartd')."),
      },
    },
    async ({ name }): Promise<{ content: Array<{ type: "text"; text: string }> }> => {
      try {
        const client = getTrueNASClient();
        const result = await client.call("service.stop", [name, { silent: false }]);
        return { content: [{ type: "text", text: `Service '${name}' stop result: ${JSON.stringify(result)}` }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.registerTool(
    "restart_service",
    {
      title: "Restart Service",
      description: "Restart a TrueNAS service by name.",
      inputSchema: {
        name: z.string().describe("The service name (e.g. 'cifs', 'nfs', 'ssh', 'smartd')."),
      },
    },
    async ({ name }): Promise<{ content: Array<{ type: "text"; text: string }> }> => {
      try {
        const client = getTrueNASClient();
        const result = await client.call("service.restart", [name]);
        return { content: [{ type: "text", text: `Service '${name}' restart result: ${JSON.stringify(result)}` }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );
}
