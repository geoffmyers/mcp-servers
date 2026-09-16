# CLAUDE.md - pfSense MCP Server

## Project Overview
MCP server for managing pfSense+ firewalls via the REST API v2. Provides 34 tools, 5 resources, and 3 prompts for firewall rules, NAT/port forwarding, aliases, interfaces, services (DHCP, DNS), VPN (OpenVPN, IPsec, WireGuard), diagnostics (ping, traceroute, ARP, routing table), and gateway monitoring.

## Architecture / Key Files
- `src/index.ts` - Entry point, transport selection (stdio or streamableHttp)
- `src/server/index.ts` - Server factory, McpServer setup, loads instructions.md
- `src/lib/pfsense-client.ts` - REST client with X-API-Key authentication, TLS handling
- `src/lib/errors.ts` - PfSenseError class + formatErrorForMcp()
- `src/tools/` - 9 tool modules (34 tools total):
  - `system.ts` - get_system_info, get_system_status, get_interface_status
  - `firewall-rules.ts` - list/create/update/toggle/delete/reorder firewall rules
  - `firewall-nat.ts` - list/create/delete port forwards
  - `aliases.ts` - list/create/update/delete firewall aliases
  - `interfaces.ts` - list/get interfaces
  - `services.ts` - services status, DHCP leases, DNS resolver, DHCP static mappings
  - `vpn.ts` - OpenVPN/IPsec/WireGuard status
  - `diagnostics.ts` - ARP table, ping, traceroute, firewall states, routing table
  - `gateway.ts` - gateway health, latency, packet loss
- `src/resources/` - 5 resource modules (system info, interfaces, gateways, services, firewall rules)
- `src/prompts/` - 3 prompt modules (diagnose-connectivity, firewall-audit, vpn-setup)
- `.env.tpl` - 1Password template: PFSENSE_HOST, PFSENSE_API_KEY
- `Dockerfile` - Container build support
- `tsconfig.json` - TypeScript configuration

## Development Commands
- `npm install` - Install dependencies
- `npm run build` - Build TypeScript to dist/, copy docs, chmod +x
- `npm run watch` - TypeScript watch mode
- `npm run start:stdio` - Start with stdio transport
- `npm run start:streamableHttp` - Start with HTTP transport (port 3003)
- `npm test` - Run tests with vitest
- `npm run test:watch` - Run tests in watch mode

## Tool Categories (34 tools)
| Category | Count | Tools |
|----------|-------|-------|
| System | 3 | get_system_info, get_system_status, get_interface_status |
| Firewall Rules | 6 | list/create/update/toggle/delete/reorder_firewall_rules |
| NAT | 3 | list/create/delete_port_forward(s) |
| Aliases | 4 | list/create/update/delete_alias(es) |
| Interfaces | 2 | list_interfaces, get_interface |
| Services | 6 | list_services_status, get_dhcp_leases, get/update_dns_resolver, get_dhcp_server_config, create_dhcp_static_mapping |
| VPN | 4 | list_openvpn_servers, get_openvpn/ipsec/wireguard_status |
| Diagnostics | 5 | get_arp_table, run_ping, run_traceroute, get_firewall_states, get_routing_table |
| Gateway | 1 | get_gateway_status |

## Resources (5)
- `pfsense://system/info` - System version, hostname, uptime
- `pfsense://interfaces` - All interface configurations
- `pfsense://gateways/status` - Gateway health and latency
- `pfsense://services/status` - Service statuses
- `pfsense://firewall/rules/{interface}` - Firewall rules for a specific interface

## Prompts (3)
- `diagnose-connectivity` - Diagnose connectivity using ping, traceroute, gateway, ARP
- `firewall-audit` - Audit rules for security issues
- `vpn-setup` - Guide through VPN configuration

## Common Tasks
- **Add a new tool**: Create a new file in `src/tools/` or add to existing module, register in `src/tools/index.ts`
- **Add a new resource**: Create file in `src/resources/`, register in `src/resources/index.ts`
- **Add a new prompt**: Create file in `src/prompts/`, register in `src/prompts/index.ts`
- **Test locally**: `npm run build && PFSENSE_HOST=... PFSENSE_API_KEY=... node dist/index.js stdio`
- **Generate .env**: `op inject -i .env.tpl -o .env`

## Gotchas
- Default HTTP port is 3003 (override with PORT env var)
- Requires PFSENSE_HOST and PFSENSE_API_KEY environment variables
- Self-signed TLS certificates are accepted by default (PFSENSE_VERIFY_SSL=false)
- Set PFSENSE_SECURE=false to use plain HTTP instead of HTTPS
- The pfSense REST API v2 returns `{ code, status, response_id, message, data }` envelope; the client automatically unwraps to `data`
- Destructive operations (delete_firewall_rule, delete_port_forward, delete_alias) require `confirm: true`
- Build step copies `docs/` into `dist/docs/` for runtime instruction loading
- Credentials managed via 1Password CLI (vault: <vault>, item: pfsense-mcp)
- **DHCP backend is kea-dhcp4 — isc-dhcpd is deprecated and unused on this firewall.** All DHCP-related tools (`get_dhcp_leases`, `get_dhcp_server_config`, `create_dhcp_static_mapping`) operate against kea state. If a tool ever needs to read raw lease data, it must come from `/var/lib/kea/dhcp4.leases` (kea memfile), not `/var/dhcpd/var/db/dhcpd.leases` (stale isc artifact). Static reservations are still stored in `<dhcpd>/<iface>/<staticmap>` in `config.xml` and ingested by kea.
