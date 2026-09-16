import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { executeAuto, getServerConfig, formatErrorForMcp } from "@geoffmyers/mcp-server-shared";

function ipCompare(a: string, b: string): number {
  const pa = a.split(".").map((n) => parseInt(n, 10));
  const pb = b.split(".").map((n) => parseInt(n, 10));
  for (let i = 0; i < 4; i++) {
    if (pa[i] !== pb[i]) return (pa[i] || 0) - (pb[i] || 0);
  }
  return 0;
}

export function registerServiceTools(server: McpServer): void {
  const config = getServerConfig();

  server.tool(
    "list_services",
    "List pfSense services and their status",
    {},
    async (): Promise<CallToolResult> => {
      try {
        const phpCode = `require_once('config.inc'); require_once('service-utils.inc'); $services = get_services(); foreach($services as $s) { echo $s['name'] . ' | ' . (get_service_status($s) ? 'running' : 'stopped') . "\\n"; }`;
        const result = await executeAuto(config, "php", ["-r", phpCode]);
        if (result.exitCode !== 0) {
          return { isError: true, content: [{ type: "text", text: `List services failed: ${result.stderr}` }] };
        }
        return { content: [{ type: "text", text: result.stdout || "No services found." }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.tool(
    "restart_service",
    "Restart a pfSense service (requires confirm: true)",
    {
      service: z.string().describe("Service name to restart"),
      confirm: z.boolean().describe("Must be true to execute this destructive operation"),
    },
    async (args): Promise<CallToolResult> => {
      if (!args.confirm) {
        return { isError: true, content: [{ type: "text", text: "Destructive operation: set confirm: true to restart the service." }] };
      }
      try {
        const result = await executeAuto(config, "pfSsh.php", ["playback", "svc", "restart", args.service]);
        if (result.exitCode !== 0) {
          return { isError: true, content: [{ type: "text", text: `Restart service failed: ${result.stderr}` }] };
        }
        return { content: [{ type: "text", text: result.stdout || `Service ${args.service} restarted.` }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.tool(
    "dhcp_leases",
    "View kea-dhcp4 lease table (active leases only)",
    {},
    async (): Promise<CallToolResult> => {
      try {
        const result = await executeAuto(config, "cat", ["/var/lib/kea/dhcp4.leases"]);
        if (result.exitCode !== 0) {
          return { isError: true, content: [{ type: "text", text: `Read kea DHCP leases failed: ${result.stderr}` }] };
        }
        const lines = (result.stdout || "").split("\n").filter((l) => l.length > 0);
        if (lines.length < 2) {
          return { content: [{ type: "text", text: "No kea DHCP leases found." }] };
        }
        const header = lines[0].split(",");
        const ipIdx = header.indexOf("address");
        const macIdx = header.indexOf("hwaddr");
        const expireIdx = header.indexOf("expire");
        const stateIdx = header.indexOf("state");
        const hostnameIdx = header.indexOf("hostname");
        const subnetIdx = header.indexOf("subnet_id");
        const now = Math.floor(Date.now() / 1000);
        const seen = new Map<string, { ip: string; mac: string; hostname: string; expire: number; state: string; subnet: string }>();
        for (let i = 1; i < lines.length; i++) {
          const fields = lines[i].split(",");
          if (fields.length < header.length) continue;
          const ip = fields[ipIdx];
          const expire = parseInt(fields[expireIdx], 10) || 0;
          const stateNum = fields[stateIdx];
          const stateLabel = stateNum === "0" ? "active" : stateNum === "1" ? "declined" : stateNum === "2" ? "expired-reclaimed" : `state-${stateNum}`;
          if (stateNum !== "0" || expire <= now) continue;
          seen.set(ip, {
            ip,
            mac: fields[macIdx],
            hostname: fields[hostnameIdx] || "",
            expire,
            state: stateLabel,
            subnet: fields[subnetIdx],
          });
        }
        const rows = Array.from(seen.values()).sort((a, b) => ipCompare(a.ip, b.ip));
        const out = rows.map((r) => {
          const expiresIn = r.expire - now;
          const expiresStr = expiresIn > 86400 ? `${Math.floor(expiresIn / 86400)}d` : expiresIn > 3600 ? `${Math.floor(expiresIn / 3600)}h` : `${Math.floor(expiresIn / 60)}m`;
          return `${r.ip}\t${r.mac}\t${r.hostname || "-"}\t${r.state}\texpires_in=${expiresStr}\tsubnet=${r.subnet}`;
        }).join("\n");
        const text = `# kea-dhcp4 active leases (${rows.length})\n# ip\tmac\thostname\tstate\texpires_in\tsubnet_id\n${out}`;
        return { content: [{ type: "text", text }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.tool(
    "dns_resolver_status",
    "Check DNS resolver (Unbound) status and statistics",
    {},
    async (): Promise<CallToolResult> => {
      try {
        const result = await executeAuto(config, "unbound-control", ["-c", "/var/unbound/unbound.conf", "stats_noreset"]);
        if (result.exitCode !== 0) {
          return { isError: true, content: [{ type: "text", text: `DNS resolver status failed: ${result.stderr}` }] };
        }
        return { content: [{ type: "text", text: result.stdout || "No DNS resolver status available." }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );

  server.tool(
    "list_dhcp_static_mappings",
    "List DHCP static mappings (reservations) for an interface. Reads <dhcpd>/<iface>/<staticmap> from config.xml; kea-dhcp4 ingests this same XML (isc-dhcpd is deprecated/unused).",
    {
      interface: z.string().optional().default("lan").describe("Interface key as used in config.xml: 'lan', 'opt1', 'opt2', etc. The interface description (e.g. 'VLAN30') is NOT a valid key. Default: lan"),
    },
    async (args): Promise<CallToolResult> => {
      try {
        const iface = args.interface;
        const phpCode = `require_once('/etc/inc/config.inc'); $c = parse_config(true); echo json_encode($c['dhcpd']['` + iface + `']['staticmap'] ?? [], JSON_PRETTY_PRINT);`;
        const result = await executeAuto(config, "php", ["-r", phpCode]);
        if (result.exitCode !== 0) {
          return { isError: true, content: [{ type: "text", text: `List DHCP static mappings failed: ${result.stderr}` }] };
        }
        return { content: [{ type: "text", text: result.stdout || "No DHCP static mappings found." }] };
      } catch (error) {
        return formatErrorForMcp(error);
      }
    }
  );
}
