import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { execute, formatErrorForMcp } from "@geoffmyers/mcp-server-shared";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";

export function registerSedTools(server: McpServer): void {
  server.tool(
    "sed_preview",
    "Preview a sed substitution without modifying the file (dry run)",
    {
      pattern: z.string().describe("Sed substitution pattern (e.g. 's/old/new/')"),
      file: z.string().describe("Path to the file to process"),
      global: z.boolean().optional().default(false).describe("Apply substitution globally on each line (appends 'g' flag)"),
      extended_regex: z.boolean().optional().default(false).describe("Use extended regular expressions (-E flag)"),
      case_insensitive: z.boolean().optional().default(false).describe("Case-insensitive matching (appends 'I' flag)"),
    },
    async (args): Promise<CallToolResult> => {
      try {
        let pattern = args.pattern;
        const flags: string[] = [];
        if (args.global) flags.push("g");
        if (args.case_insensitive) flags.push("I");

        if (flags.length > 0) {
          // Append flags to the pattern (e.g. s/old/new/ -> s/old/new/gI)
          const lastSlash = pattern.lastIndexOf("/");
          if (lastSlash === pattern.length - 1) {
            pattern = pattern.slice(0, -1) + flags.join("") + "/";
          }
        }

        const sedArgs: string[] = [];
        if (args.extended_regex) sedArgs.push("-E");
        sedArgs.push(pattern, args.file);

        const result = await execute("sed", sedArgs);

        if (result.exitCode !== 0 && result.stderr) {
          return { isError: true, content: [{ type: "text", text: `sed error: ${result.stderr}` }] };
        }

        return { content: [{ type: "text", text: result.stdout || "(no output)" }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.tool(
    "sed_replace",
    "Perform an in-place sed substitution on a file (creates backup)",
    {
      pattern: z.string().describe("Sed substitution pattern (e.g. 's/old/new/')"),
      file: z.string().describe("Path to the file to modify"),
      global: z.boolean().optional().default(false).describe("Apply substitution globally on each line (appends 'g' flag)"),
      extended_regex: z.boolean().optional().default(false).describe("Use extended regular expressions (-E flag)"),
      case_insensitive: z.boolean().optional().default(false).describe("Case-insensitive matching (appends 'I' flag)"),
      confirm: z.boolean().describe("Must be true to proceed with in-place replacement"),
      backup_suffix: z.string().optional().default(".bak").describe("Backup file suffix (default: '.bak')"),
    },
    async (args): Promise<CallToolResult> => {
      try {
        if (!args.confirm) {
          return { content: [{ type: "text", text: "Replace aborted: confirm must be true." }] };
        }

        let pattern = args.pattern;
        const flags: string[] = [];
        if (args.global) flags.push("g");
        if (args.case_insensitive) flags.push("I");

        if (flags.length > 0) {
          const lastSlash = pattern.lastIndexOf("/");
          if (lastSlash === pattern.length - 1) {
            pattern = pattern.slice(0, -1) + flags.join("") + "/";
          }
        }

        // macOS sed -i requires the suffix as a separate argument
        const sedArgs: string[] = [];
        if (args.extended_regex) sedArgs.push("-E");
        sedArgs.push("-i", args.backup_suffix, pattern, args.file);

        const result = await execute("sed", sedArgs);

        if (result.exitCode !== 0 && result.stderr) {
          return { isError: true, content: [{ type: "text", text: `sed error: ${result.stderr}` }] };
        }

        return {
          content: [{ type: "text", text: `File modified in-place. Backup saved as ${args.file}${args.backup_suffix}` }],
        };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.tool(
    "sed_extract",
    "Extract lines from a file using sed -n (e.g. print specific line ranges or pattern matches)",
    {
      expression: z.string().describe("Sed expression for extraction (e.g. '5,10p' for lines 5-10, '/pattern/p' for matching lines)"),
      file: z.string().describe("Path to the file to process"),
    },
    async (args): Promise<CallToolResult> => {
      try {
        const sedArgs: string[] = ["-n", args.expression, args.file];

        const result = await execute("sed", sedArgs);

        if (result.exitCode !== 0 && result.stderr) {
          return { isError: true, content: [{ type: "text", text: `sed error: ${result.stderr}` }] };
        }

        return { content: [{ type: "text", text: result.stdout || "(no matching lines)" }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );
}
