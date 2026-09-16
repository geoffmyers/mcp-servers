# CLAUDE.md - pfSense CLI MCP Server

## Project Overview
MCP server wrapping pfSense CLI tools (pfctl, pfSsh.php, FreeBSD utilities) for firewall, network, service, DNS, and VPN management. Supports local or SSH execution via `@geoffmyers/mcp-server-shared`. Provides 27 tools, 3 resources, and 2 prompts.

## Architecture / Key Files
- `src/index.ts` - Entry point, transport selection (stdio or streamableHttp)
- `src/server/index.ts` - Server factory, McpServer setup, loads instructions.md
- `src/tools/firewall.ts` - Firewall tools: list rules, states, state count, aliases
- `src/tools/network.ts` - Network tools: ARP, routing
- `src/tools/interfaces.ts` - Interface tools: list interfaces, interface status, interface stats
- `src/tools/services.ts` - Service tools: list, restart, DHCP leases, DNS resolver, DHCP static mappings
- `src/tools/system.ts` - System tools: info, reboot
- `src/tools/vpn.ts` - VPN tools: OpenVPN, IPsec, WireGuard status
- `src/tools/diagnostics.ts` - Diagnostic tools: ping, traceroute, packages, config backup, DNS lookup
- `src/tools/dns.ts` - DNS tools: host overrides, domain overrides
- `src/tools/index.ts` - Tool registration
- `src/resources/index.ts` - Resources: pfsense-cli://system/info, pfsense-cli://interfaces, pfsense-cli://firewall/rules
- `src/prompts/connectivity-diagnose.ts` - Network connectivity diagnosis prompt
- `src/prompts/firewall-audit.ts` - Firewall rule audit prompt
- `docs/instructions.md` - Server instructions bundled into dist/
- `.env.tpl` - Environment configuration (EXECUTION_MODE, SSH_HOST)

## Development Commands
- `npm install` - Install dependencies
- `npm run build` - Build TypeScript to dist/, copy docs, chmod +x
- `npm run watch` - TypeScript watch mode
- `npm run start:stdio` - Start with stdio transport
- `npm run start:streamableHttp` - Start with HTTP transport (port 3024)

## Gotchas
- Default HTTP port is 3024 (override with PORT env var)
- Uses various FreeBSD/pfSense commands: `pfctl`, `pfSsh.php`, `ifconfig`, `arp`, `netstat`
- `pfSsh.php playback` is used for gateway status and service management
- Only `restart_service` and `system_reboot` require `confirm: true`
- This server complements (not replaces) the API-based `pfsense-mcp-server`
- **DHCP backend is kea-dhcp4 — isc-dhcpd is deprecated and unused.** Any DHCP tool added here must read kea state, never isc-dhcpd state:
  - Active leases live at `/var/lib/kea/dhcp4.leases` (CSV memfile; path set in `/usr/local/etc/kea/kea-dhcp4.conf` under `lease-database.name`). Header row: `address,hwaddr,client_id,valid_lifetime,expire,subnet_id,fqdn_fwd,fqdn_rev,hostname,state,user_context,pool_id`. Filter to `state=0` and `expire > now` for the live set.
  - **Do not** read `/var/dhcpd/var/db/dhcpd.leases` or `/var/dhcpd/etc/dhcpd.conf` — those files are leftovers from the isc-dhcpd era and contain stale data.
  - Static reservations are still stored in `<dhcpd>/<iface>/<staticmap>` inside `config.xml` and are ingested by kea (each mapping may carry a sibling `<custom_kea_config>` element). Interface keys are `lan`, `opt1`, `opt2`, … — the `<descr>` (e.g. `VLAN30`) is not a valid key.
  - To apply reservation changes, kea must be reloaded via `services_dhcpd_configure()` or a filter reload; `--upload-only` writes the XML but does not regenerate the kea config.
