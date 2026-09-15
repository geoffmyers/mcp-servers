import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { executeAuto, getServerConfig, formatErrorForMcp } from "@geoffmyers/mcp-server-shared";

export function registerAddonTools(server: McpServer): void {
  const config = getServerConfig();

  server.tool(
    "addon_list",
    "List all installed Home Assistant add-ons",
    {},
    async (): Promise<CallToolResult> => {
      try {
        const result = await executeAuto(config, "ha", ["addons", "--raw-json"]);
        if (result.exitCode !== 0) {
          return { isError: true, content: [{ type: "text", text: `ha addons failed: ${result.stderr}` }] };
        }
        return { content: [{ type: "text", text: result.stdout }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.tool(
    "addon_info",
    "Get detailed information about a specific add-on",
    {
      slug: z.string().describe("Add-on slug identifier (e.g. 'core_mosquitto', 'a0d7b954_nodered')"),
    },
    async (args): Promise<CallToolResult> => {
      try {
        const result = await executeAuto(config, "ha", ["addons", "info", args.slug, "--raw-json"]);
        if (result.exitCode !== 0) {
          return { isError: true, content: [{ type: "text", text: `ha addons info failed: ${result.stderr}` }] };
        }
        return { content: [{ type: "text", text: result.stdout }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.tool(
    "addon_start",
    "Start a Home Assistant add-on",
    {
      slug: z.string().describe("Add-on slug identifier"),
    },
    async (args): Promise<CallToolResult> => {
      try {
        const result = await executeAuto(config, "ha", ["addons", "start", args.slug, "--raw-json"]);
        if (result.exitCode !== 0) {
          return { isError: true, content: [{ type: "text", text: `ha addons start failed: ${result.stderr}` }] };
        }
        return { content: [{ type: "text", text: result.stdout || `Add-on ${args.slug} started.` }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.tool(
    "addon_stop",
    "Stop a running Home Assistant add-on (requires confirm: true)",
    {
      slug: z.string().describe("Add-on slug identifier"),
      confirm: z.boolean().describe("Must be true to execute this destructive operation"),
    },
    async (args): Promise<CallToolResult> => {
      if (!args.confirm) {
        return { isError: true, content: [{ type: "text", text: "Destructive operation: set confirm: true to stop this add-on." }] };
      }
      try {
        const result = await executeAuto(config, "ha", ["addons", "stop", args.slug, "--raw-json"]);
        if (result.exitCode !== 0) {
          return { isError: true, content: [{ type: "text", text: `ha addons stop failed: ${result.stderr}` }] };
        }
        return { content: [{ type: "text", text: result.stdout || `Add-on ${args.slug} stopped.` }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.tool(
    "addon_restart",
    "Restart a Home Assistant add-on (requires confirm: true)",
    {
      slug: z.string().describe("Add-on slug identifier"),
      confirm: z.boolean().describe("Must be true to execute this destructive operation"),
    },
    async (args): Promise<CallToolResult> => {
      if (!args.confirm) {
        return { isError: true, content: [{ type: "text", text: "Destructive operation: set confirm: true to restart this add-on." }] };
      }
      try {
        const result = await executeAuto(config, "ha", ["addons", "restart", args.slug, "--raw-json"]);
        if (result.exitCode !== 0) {
          return { isError: true, content: [{ type: "text", text: `ha addons restart failed: ${result.stderr}` }] };
        }
        return { content: [{ type: "text", text: result.stdout || `Add-on ${args.slug} restarted.` }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.tool(
    "addon_update",
    "Update a Home Assistant add-on to the latest version (requires confirm: true)",
    {
      slug: z.string().describe("Add-on slug identifier"),
      confirm: z.boolean().describe("Must be true to execute this destructive operation"),
    },
    async (args): Promise<CallToolResult> => {
      if (!args.confirm) {
        return { isError: true, content: [{ type: "text", text: "Destructive operation: set confirm: true to update this add-on." }] };
      }
      try {
        const result = await executeAuto(config, "ha", ["addons", "update", args.slug, "--raw-json"]);
        if (result.exitCode !== 0) {
          return { isError: true, content: [{ type: "text", text: `ha addons update failed: ${result.stderr}` }] };
        }
        return { content: [{ type: "text", text: result.stdout || `Add-on ${args.slug} update initiated.` }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.tool(
    "addon_logs",
    "View logs from a Home Assistant add-on",
    {
      slug: z.string().describe("Add-on slug identifier"),
    },
    async (args): Promise<CallToolResult> => {
      try {
        const result = await executeAuto(config, "ha", ["addons", "logs", args.slug], { maxBuffer: 512 * 1024 });
        if (result.exitCode !== 0) {
          return { isError: true, content: [{ type: "text", text: `ha addons logs failed: ${result.stderr}` }] };
        }
        const output = result.stdout || result.stderr;
        return { content: [{ type: "text", text: output || "No logs found." }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.tool(
    "addon_install",
    "Install a Home Assistant add-on (requires confirm: true)",
    {
      repository: z.string().describe("Add-on slug or repository URL"),
      confirm: z.boolean().describe("Must be true to execute this destructive operation"),
    },
    async (args): Promise<CallToolResult> => {
      if (!args.confirm) {
        return { isError: true, content: [{ type: "text", text: "Destructive operation: set confirm: true to install this add-on." }] };
      }
      try {
        const result = await executeAuto(config, "ha", ["addons", "install", args.repository, "--raw-json"], { timeout: 300_000 });
        if (result.exitCode !== 0) {
          return { isError: true, content: [{ type: "text", text: `ha addons install failed: ${result.stderr}` }] };
        }
        return { content: [{ type: "text", text: result.stdout || `Add-on ${args.repository} installed.` }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.tool(
    "addon_uninstall",
    "Uninstall a Home Assistant add-on (requires confirm: true)",
    {
      slug: z.string().describe("Add-on slug identifier"),
      confirm: z.boolean().describe("Must be true to execute this destructive operation"),
    },
    async (args): Promise<CallToolResult> => {
      if (!args.confirm) {
        return { isError: true, content: [{ type: "text", text: "Destructive operation: set confirm: true to uninstall this add-on." }] };
      }
      try {
        const result = await executeAuto(config, "ha", ["addons", "uninstall", args.slug, "--raw-json"]);
        if (result.exitCode !== 0) {
          return { isError: true, content: [{ type: "text", text: `ha addons uninstall failed: ${result.stderr}` }] };
        }
        return { content: [{ type: "text", text: result.stdout || `Add-on ${args.slug} uninstalled.` }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.tool(
    "addon_stats",
    "View resource usage statistics for a Home Assistant add-on",
    {
      slug: z.string().describe("Add-on slug identifier"),
    },
    async (args): Promise<CallToolResult> => {
      try {
        const result = await executeAuto(config, "ha", ["addons", "stats", args.slug, "--raw-json"]);
        if (result.exitCode !== 0) {
          return { isError: true, content: [{ type: "text", text: `ha addons stats failed: ${result.stderr}` }] };
        }
        return { content: [{ type: "text", text: result.stdout }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );
}
