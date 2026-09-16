import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export function registerVpnSetupPrompt(server: McpServer): void {
  server.registerPrompt(
    "vpn-setup",
    {
      title: "VPN Setup Guide",
      description:
        "Guide through VPN configuration for WireGuard, OpenVPN, or IPsec",
      argsSchema: {
        vpnType: z
          .string()
          .describe(
            'VPN type to configure: "wireguard", "openvpn", or "ipsec"'
          ),
      },
    },
    (args) => ({
      messages: [
        {
          role: "user" as const,
          content: {
            type: "text" as const,
            text: `Please guide me through setting up a ${args.vpnType} VPN on pfSense. Start by using the available tools to:

1. Check the current ${args.vpnType} VPN status and any existing configurations
2. Review the current network interfaces and IP addressing to plan the VPN subnet
3. Check for any firewall rules that may already exist for VPN traffic

Then provide a step-by-step setup guide for ${args.vpnType} that includes:
- Recommended encryption and authentication settings
- Server/tunnel configuration parameters
- Required firewall rules to allow VPN traffic
- Client configuration instructions
- Testing and verification steps

Tailor the instructions to the current pfSense environment based on what you find.`,
          },
        },
      ],
    })
  );
}
