import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { execute, formatErrorForMcp } from "@geoffmyers/mcp-server-shared";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";

export function registerNmapTools(server: McpServer): void {
  server.tool(
    "nmap_ping_scan",
    "Host discovery scan (-sn). Finds live hosts without port scanning.",
    {
      target: z.string().describe("Target specification (IP, hostname, CIDR, or range e.g. '192.168.1.0/24')"),
      timeout: z.coerce.number().positive().optional().describe("Command timeout in milliseconds"),
    },
    async (args): Promise<CallToolResult> => {
      try {
        const nmapArgs: string[] = ["-sn", args.target];
        const result = await execute("nmap", nmapArgs, { timeout: args.timeout });

        const output = [result.stdout, result.stderr].filter(Boolean).join("\n");
        return { content: [{ type: "text", text: output || "No results returned." }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.tool(
    "nmap_port_scan",
    "Port scan with optional service version detection. Uses TCP connect scan (-sT).",
    {
      target: z.string().describe("Target specification (IP, hostname, CIDR, or range)"),
      ports: z.string().optional().describe("Port specification (e.g. '22,80,443', '1-1024', 'U:53,T:25,80')"),
      scan_type: z.enum(["tcp_connect"]).default("tcp_connect").describe("Scan type (tcp_connect maps to -sT)"),
      service_detection: z.boolean().optional().describe("Enable service/version detection (-sV)"),
      timeout: z.coerce.number().positive().optional().describe("Command timeout in milliseconds"),
    },
    async (args): Promise<CallToolResult> => {
      try {
        const nmapArgs: string[] = [];

        // Map scan type
        if (args.scan_type === "tcp_connect") {
          nmapArgs.push("-sT");
        }

        if (args.service_detection) {
          nmapArgs.push("-sV");
        }

        if (args.ports) {
          nmapArgs.push("-p", args.ports);
        }

        nmapArgs.push(args.target);

        const result = await execute("nmap", nmapArgs, { timeout: args.timeout });

        const output = [result.stdout, result.stderr].filter(Boolean).join("\n");
        return { content: [{ type: "text", text: output || "No results returned." }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.tool(
    "nmap_os_detection",
    "OS fingerprinting scan (-O). Attempts to identify the operating system of the target.",
    {
      target: z.string().describe("Target specification (IP, hostname, CIDR, or range)"),
      timeout: z.coerce.number().positive().optional().describe("Command timeout in milliseconds"),
    },
    async (args): Promise<CallToolResult> => {
      try {
        const nmapArgs: string[] = ["-O", args.target];
        const result = await execute("nmap", nmapArgs, { timeout: args.timeout });

        const output = [result.stdout, result.stderr].filter(Boolean).join("\n");
        return { content: [{ type: "text", text: output || "No results returned." }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.tool(
    "nmap_quick_scan",
    "Fast scan (-F). Scans fewer ports than the default scan for speed.",
    {
      target: z.string().describe("Target specification (IP, hostname, CIDR, or range)"),
      timeout: z.coerce.number().positive().optional().describe("Command timeout in milliseconds"),
    },
    async (args): Promise<CallToolResult> => {
      try {
        const nmapArgs: string[] = ["-F", args.target];
        const result = await execute("nmap", nmapArgs, { timeout: args.timeout });

        const output = [result.stdout, result.stderr].filter(Boolean).join("\n");
        return { content: [{ type: "text", text: output || "No results returned." }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );
}
