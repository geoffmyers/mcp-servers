# pfSense CLI MCP Server

## Overview
A [Model Context Protocol](https://modelcontextprotocol.io/) (MCP) server for
monitoring and managing a [pfSense](https://www.pfsense.org/) firewall via
CLI commands (`pfctl`, `ifconfig`, `arp`, `netstat`, `pfSsh.php`, and reads of
`config.xml`) executed over SSH. Mostly diagnostics and read-only queries,
with two operations — reboot and service restart — gated behind explicit
confirmation.

## Requirements
- Node.js 20.6+
- TypeScript
- SSH key-based access to the pfSense host (the pfSense web UI's SSH access
  must be enabled: **System > Advanced > Admin Access**)
- A pfSense user with shell access (the default `admin` account, or a
  dedicated account with the `shell` privilege)

## Installation
From the repository root (the servers are one npm workspace):

```bash
npm ci
npm run build
```

## Configuration

### Claude Desktop / Claude Code
```json
{
  "mcpServers": {
    "pfsense-cli": {
      "command": "node",
      "args": ["/path/to/mcp-servers/pfsense-cli-mcp-server/dist/index.js", "stdio"]
    }
  }
}
```

### Environment Variables
| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `EXECUTION_MODE` | No | `local` | `local` runs commands on this machine; `ssh` runs them on `SSH_HOST`. Set `ssh` unless the server runs on the pfSense box itself (`.env.example` does) |
| `SSH_HOST` | Only if `EXECUTION_MODE=ssh` | — | pfSense host to SSH into |
| `PORT` | No | `3024` | HTTP transport port |

See `.env.example` for a filled-in template.

## Tools

27 tools, 2 of which are destructive and require `confirm: true`.

| Tool | Description |
|------|-------------|
| `system_info` | Get pfSense system information (hostname, kernel, uptime) |
| `system_reboot` | Reboot the pfSense system (requires `confirm: true`) |
| `list_firewall_rules` | List active pfSense firewall rules (`pfctl -sr`) |
| `firewall_states` | View active firewall state table entries (`pfctl -ss`) |
| `firewall_state_count` | View firewall state statistics and counters (`pfctl -si`) |
| `list_firewall_aliases` | List firewall aliases from pfSense config |
| `list_interfaces` | List all network interfaces (`ifconfig -a`) |
| `interface_status` | View interface statistics via pfctl (`pfctl -sI`) |
| `interface_stats` | Get detailed interface statistics via pfctl (`pfctl -vvsI -i <interface>`) |
| `gateway_status` | View gateway status (uses `pfSsh.php playback gatewaystatus`, falls back to `/tmp/gateway_status`) |
| `list_services` | List pfSense services and their status |
| `restart_service` | Restart a pfSense service (requires `confirm: true`) |
| `dhcp_leases` | View kea-dhcp4 lease table (active leases only) |
| `dns_resolver_status` | Check DNS resolver (Unbound) status and statistics |
| `list_dhcp_static_mappings` | List DHCP static mappings (reservations) for an interface — reads `<dhcpd>/<iface>/<staticmap>` from `config.xml`; kea-dhcp4 ingests this same XML (isc-dhcpd is deprecated and unused) |
| `arp_table` | View ARP table (`arp -an`) |
| `routing_table` | View routing table (`netstat -rn`) |
| `openvpn_status` | View OpenVPN server and client connection status |
| `ipsec_status` | View IPsec tunnel status |
| `wireguard_status` | View WireGuard tunnel status |
| `ping` | Ping a host from pfSense |
| `traceroute` | Traceroute to a host from pfSense |
| `list_packages` | List installed packages on pfSense (`pkg info`) |
| `backup_config` | Read the pfSense configuration XML backup (`/cf/conf/config.xml`) |
| `dns_lookup` | Perform DNS lookup from pfSense |
| `list_dns_host_overrides` | List DNS Resolver (Unbound) host overrides from pfSense config |
| `list_dns_domain_overrides` | List DNS Resolver (Unbound) domain overrides from pfSense config |

## Resources
| Resource | Description |
|----------|-------------|
| `system-info` | pfSense system information (hostname, kernel, uptime) |
| `interfaces` | pfSense network interfaces |
| `gateways` | pfSense gateway status |

## Prompts
| Prompt | Description |
|--------|-------------|
| `firewall-audit` | Audit firewall rules on a pfSense interface |
| `diagnose-connectivity` | Diagnose network connectivity issues from pfSense to a target host |

## Safety
- `system_reboot` and `restart_service` require an explicit `confirm: true` argument; every other tool is read-only.
- All commands run via `execFile` over SSH (array arguments, no shell string-building on this end), so tool inputs cannot inject shell metacharacters into the SSH command itself.
- `backup_config` reads the live `config.xml`, which can contain sensitive values (hashed passwords, PSKs) — treat its output accordingly.

## Author
Geoff Myers
