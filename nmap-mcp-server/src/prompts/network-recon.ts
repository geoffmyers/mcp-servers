import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export function registerNetworkReconPrompt(server: McpServer): void {
  server.prompt(
    "network-recon",
    "Help perform network reconnaissance on a target",
    {
      target: z.string().describe("Target IP, hostname, or CIDR range to scan"),
    },
    (args) => ({
      messages: [
        {
          role: "user" as const,
          content: {
            type: "text" as const,
            text: `Perform network reconnaissance on the target: "${args.target}"

Use the available nmap tools to:
1. Start with a ping scan (nmap_ping_scan) to discover live hosts
2. Run a quick scan (nmap_quick_scan) on discovered hosts to find open ports
3. For interesting hosts, run a detailed port scan (nmap_port_scan) with service detection
4. Optionally run OS detection (nmap_os_detection) on key targets

Summarize the findings including live hosts, open ports, detected services, and OS information.`,
          },
        },
      ],
    })
  );
}
