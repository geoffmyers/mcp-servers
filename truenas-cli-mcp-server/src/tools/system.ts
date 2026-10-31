import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { executeAuto, getServerConfig, formatErrorForMcp } from "@geoffmyers/mcp-server-shared";

// system.reboot / system.shutdown are jobs that take a required `reason` (TrueNAS 25.04+).
// Without -j midclt prints the job id and exits 0 even when the job then fails, and -j would
// block until the host goes down, so start the job, give it a moment, and read its state.
async function startPowerJob(
  config: ReturnType<typeof getServerConfig>,
  method: "system.reboot" | "system.shutdown",
  reason: string,
  verb: string
): Promise<CallToolResult> {
  const result = await executeAuto(config, "midclt", ["call", method, reason]);
  if (result.exitCode !== 0) {
    return { isError: true, content: [{ type: "text", text: `midclt call ${method} failed: ${result.stderr}` }] };
  }
  const jobId = Number(result.stdout.trim());
  if (!Number.isInteger(jobId)) {
    return { content: [{ type: "text", text: result.stdout || `System ${verb} initiated.` }] };
  }
  await new Promise((resolve) => setTimeout(resolve, 3000));
  const check = await executeAuto(config, "midclt", ["call", "core.get_jobs", JSON.stringify([["id", "=", jobId]])]);
  // The host may already be going down, so an unreadable job state is not a failure.
  if (check.exitCode === 0) {
    try {
      const [job] = JSON.parse(check.stdout) as { state?: string; error?: string }[];
      if (job?.state === "FAILED" || job?.state === "ABORTED") {
        return { isError: true, content: [{ type: "text", text: `${method} job ${jobId} ${job.state}: ${job.error ?? "no error given"}` }] };
      }
      return { content: [{ type: "text", text: `System ${verb} initiated (job ${jobId}, ${job?.state ?? "unknown"}).` }] };
    } catch {
      // fall through
    }
  }
  return { content: [{ type: "text", text: `System ${verb} initiated (job ${jobId}).` }] };
}

export function registerSystemTools(server: McpServer): void {
  const config = getServerConfig();

  server.tool(
    "system_info",
    "Get TrueNAS SCALE system information (hostname, version, uptime, etc.)",
    {},
    async (): Promise<CallToolResult> => {
      try {
        const result = await executeAuto(config, "midclt", ["call", "system.info"]);
        if (result.exitCode !== 0) {
          return { isError: true, content: [{ type: "text", text: `midclt call system.info failed: ${result.stderr}` }] };
        }
        return { content: [{ type: "text", text: result.stdout }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.tool(
    "system_reboot",
    "Reboot the TrueNAS SCALE system (requires confirm: true)",
    {
      confirm: z.boolean().describe("Must be true to execute this destructive operation"),
      reason: z.string().min(1).describe("Why the system is being rebooted (required by the middleware, recorded in its audit log)"),
    },
    async (args): Promise<CallToolResult> => {
      if (!args.confirm) {
        return { isError: true, content: [{ type: "text", text: "Destructive operation: set confirm: true to reboot the system." }] };
      }
      try {
        return await startPowerJob(config, "system.reboot", args.reason, "reboot");
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.tool(
    "system_shutdown",
    "Shut down the TrueNAS SCALE system (requires confirm: true)",
    {
      confirm: z.boolean().describe("Must be true to execute this destructive operation"),
      reason: z.string().min(1).describe("Why the system is being shut down (required by the middleware, recorded in its audit log)"),
    },
    async (args): Promise<CallToolResult> => {
      if (!args.confirm) {
        return { isError: true, content: [{ type: "text", text: "Destructive operation: set confirm: true to shut down the system." }] };
      }
      try {
        return await startPowerJob(config, "system.shutdown", args.reason, "shutdown");
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );
}
