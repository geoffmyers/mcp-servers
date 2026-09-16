import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { executeWithStdin, formatErrorForMcp } from "@geoffmyers/mcp-server-shared";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";

const ALLOWED_COMMANDS = [
  "echo",
  "ls",
  "wc",
  "file",
  "stat",
  "md5sum",
  "sha256sum",
  "basename",
  "dirname",
  "cat",
  "head",
  "tail",
];

export function registerXargsTools(server: McpServer): void {
  server.tool(
    "xargs_execute",
    "Execute a command with arguments built from input items using xargs",
    {
      command: z.string().describe("Command to execute for each item (must be in allowlist)"),
      items: z.array(z.string()).describe("List of items to pass as arguments via stdin"),
      max_procs: z.number().int().positive().optional().default(1).describe("Maximum parallel processes (-P flag, default 1)"),
      max_args: z.number().int().positive().optional().describe("Maximum arguments per command invocation (-n flag)"),
      confirm: z.boolean().describe("Must be true to execute the command (safety confirmation)"),
    },
    async (args): Promise<CallToolResult> => {
      try {
        if (!args.confirm) {
          return {
            isError: true,
            content: [{ type: "text", text: "Execute aborted: confirm must be true." }],
          };
        }

        if (!ALLOWED_COMMANDS.includes(args.command)) {
          return {
            isError: true,
            content: [{ type: "text", text: `Command not allowed. Permitted: ${ALLOWED_COMMANDS.join(", ")}` }],
          };
        }

        const xargsArgs: string[] = ["-P", String(args.max_procs)];
        if (args.max_args !== undefined) {
          xargsArgs.push("-n", String(args.max_args));
        }
        xargsArgs.push(args.command);

        const stdinData = args.items.join("\n");
        const result = await executeWithStdin("xargs", xargsArgs, stdinData);

        const output = [
          result.stdout ? result.stdout.trimEnd() : "",
          result.stderr ? `\nSTDERR:\n${result.stderr.trimEnd()}` : "",
          `\nExit code: ${result.exitCode}`,
        ].join("");

        return { content: [{ type: "text", text: output }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );
}
