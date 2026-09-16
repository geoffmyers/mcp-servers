import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { getTrueNASClient } from "../lib/truenas-client.js";
import { formatErrorForMcp } from "../lib/errors.js";

export function registerVmTools(server: McpServer): void {
  server.registerTool(
    "list_vms",
    {
      title: "List VMs",
      description: "List all virtual machines on the TrueNAS system.",
      inputSchema: {},
    },
    async (): Promise<{ content: Array<{ type: "text"; text: string }> }> => {
      try {
        const client = getTrueNASClient();
        const result = await client.call("vm.query");
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.registerTool(
    "start_vm",
    {
      title: "Start VM",
      description: "Start a virtual machine by ID.",
      inputSchema: {
        id: z.number().describe("The numeric ID of the virtual machine to start."),
      },
    },
    async ({ id }): Promise<{ content: Array<{ type: "text"; text: string }> }> => {
      try {
        const client = getTrueNASClient();
        const result = await client.callJob("vm.start", [id]);
        return { content: [{ type: "text", text: `VM ${id} started successfully.\n${JSON.stringify(result, null, 2)}` }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.registerTool(
    "stop_vm",
    {
      title: "Stop VM",
      description: "Stop a virtual machine by ID.",
      inputSchema: {
        id: z.number().describe("The numeric ID of the virtual machine to stop."),
        force: z.boolean().optional().describe("Force stop the VM (power off immediately)."),
      },
    },
    async ({ id, force }): Promise<{ content: Array<{ type: "text"; text: string }> }> => {
      try {
        const client = getTrueNASClient();
        const params: Record<string, unknown> = {};
        if (force !== undefined) params.force = force;

        const result = await client.call("vm.stop", [id, params]);
        return { content: [{ type: "text", text: `VM ${id} stopped successfully.\n${JSON.stringify(result, null, 2)}` }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );
}
