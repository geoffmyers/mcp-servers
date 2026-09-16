import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { executeAuto, getServerConfig, formatErrorForMcp } from "@geoffmyers/mcp-server-shared";

type Verb = "START" | "STOP" | "RESTART" | "RELOAD";

/**
 * Run a service operation through the middleware.
 *
 * TrueNAS 25.04+ replaced `service.start` / `service.stop` / `service.restart` /
 * `service.reload` with a single `service.control VERB service options` job.
 * The old names are GONE, not deprecated — `midclt call service.restart ups`
 * fails with "missing 1 required positional argument: 'options'", which reads
 * like a signature change rather than a removal. The legacy call is kept as a
 * fallback so this server still works against older releases.
 *
 * Three non-obvious details, each of which reports success on a real failure:
 *
 *   1. `service.control` is a JOB. Without `-j` midclt prints a job id and exits
 *      0 immediately, so the caller learns nothing about the outcome. `-j`
 *      belongs AFTER `call` — `midclt -j call ...` is an argparse error.
 *   2. THE RESULT IS THE VERDICT, NOT THE EXIT CODE. `silent` (default true)
 *      only governs START and STOP, plus timeouts: with silent:false those
 *      raise, and midclt exits non-zero. RESTART and RELOAD do not consult it
 *      — `_restart()` is never even passed the options — so an unhealthy
 *      service after either comes back as job state SUCCESS, result `false`,
 *      exit 0. Seen live on 2026-09-16 (RELOAD ups -> SUCCESS/False). The
 *      `true` check below is load-bearing, not belt-and-braces.
 *   3. RELOAD IS A FULL RESTART for any service whose class does not set
 *      `reloadable = True` — the base default is False. Deliberately not
 *      listed here, because a list would drift: check the class under
 *      middlewared/plugins/service_/services/ (pseudo/ holds most of them).
 *      On TrueNAS 26 ssh, cifs, nfs and ftp reload in place; ups does NOT —
 *      reloading it stops and restarts the whole NUT stack, and its
 *      after_start hook restarts the host netdata unit as well.
 *
 * midclt writes the progress bar and job descriptions to STDERR and only the
 * result to stdout, so the last stdout line is the job's return value.
 */
async function controlService(verb: Verb, service: string): Promise<CallToolResult> {
  const config = getServerConfig();
  const past = { START: "started", STOP: "stopped", RESTART: "restarted", RELOAD: "reloaded" }[verb];

  const modern = await executeAuto(config, "midclt", [
    "call", "-j", "service.control", verb, service, '{"silent": false}',
  ]);

  // Only fall back when the METHOD is absent (older TrueNAS). A genuine failure
  // of the operation must surface, not be retried down a path that hides it.
  const methodMissing =
    modern.exitCode !== 0 && /method does not exist|unknown method|not a valid method/i.test(
      `${modern.stderr}${modern.stdout}`
    );

  const result = methodMissing
    ? await executeAuto(config, "midclt", ["call", `service.${verb.toLowerCase()}`, service])
    : modern;

  if (result.exitCode !== 0) {
    const how = methodMissing ? `service.${verb.toLowerCase()}` : "service.control";
    return {
      isError: true,
      content: [{ type: "text", text: `midclt call ${how} ${verb} ${service} failed: ${result.stderr || result.stdout}` }],
    };
  }

  // The job's return value is the operation's verdict. Anything but true is a
  // failure the exit code did not report.
  const out = result.stdout.trim();
  if (out && !/^true$/i.test(out.split("\n").pop() ?? "")) {
    return {
      isError: true,
      content: [{ type: "text", text: `Service ${service} was not ${past}: middleware returned ${out}` }],
    };
  }

  return { content: [{ type: "text", text: `Service ${service} ${past}.` }] };
}

export function registerServiceTools(server: McpServer): void {
  const config = getServerConfig();

  server.tool(
    "list_services",
    "List all services with their status",
    {},
    async (): Promise<CallToolResult> => {
      try {
        const result = await executeAuto(config, "midclt", ["call", "service.query"]);
        if (result.exitCode !== 0) {
          return { isError: true, content: [{ type: "text", text: `midclt call service.query failed: ${result.stderr}` }] };
        }
        return { content: [{ type: "text", text: result.stdout }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  const svc = z.string().describe("Service name (e.g. 'cifs', 'nfs', 'ssh', 'smartd')");

  const ops: Array<[string, Verb, string]> = [
    ["start_service", "START", "Start a service"],
    ["stop_service", "STOP", "Stop a service"],
    ["restart_service", "RESTART", "Restart a service"],
    ["reload_service", "RELOAD", "Reload a service. A true in-place reload (connections kept) ONLY for services the middleware marks reloadable, such as ssh, cifs, nfs and ftp. For any other service, ups included, RELOAD performs a FULL RESTART with that service's side effects. Prefer this over restart_service for ssh."],
  ];

  for (const [name, verb, description] of ops) {
    server.tool(name, description, { service: svc }, async (args): Promise<CallToolResult> => {
      try {
        return await controlService(verb, args.service);
      } catch (error) {
        return formatErrorForMcp(error);
      }
    });
  }
}
