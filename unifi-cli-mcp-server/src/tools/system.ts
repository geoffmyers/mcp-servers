import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { executeAuto, getServerConfig, formatErrorForMcp } from "@geoffmyers/mcp-server-shared";
import { mongoQuery } from "../lib/mongo.js";

export function registerSystemTools(server: McpServer): void {
  const config = getServerConfig();

  server.tool(
    "system_info",
    "Get UniFi controller container status via docker inspect",
    {},
    async (): Promise<CallToolResult> => {
      try {
        const result = await executeAuto(config, "docker", ["inspect", "unifi"]);
        if (result.exitCode !== 0) {
          return { isError: true, content: [{ type: "text", text: `docker inspect failed: ${result.stderr}` }] };
        }
        return { content: [{ type: "text", text: result.stdout }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.tool(
    "controller_status",
    "Get UniFi controller version and identity from MongoDB settings",
    {},
    async (): Promise<CallToolResult> => {
      try {
        const result = await mongoQuery(
          config,
          'db.setting.find({key:"super_identity"}).forEach(printjson)'
        );
        if (result.exitCode !== 0) {
          return { isError: true, content: [{ type: "text", text: `MongoDB query failed: ${result.stderr}` }] };
        }
        return { content: [{ type: "text", text: result.stdout || "No controller identity found." }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );
}
