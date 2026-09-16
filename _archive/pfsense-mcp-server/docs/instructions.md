# pfSense MCP Server

This MCP server provides access to the pfSense+ REST API v2 for managing firewall rules, NAT, aliases, interfaces, services, VPN, and diagnostics.

## Available Tools

### System
- `get_system_info` - Get system hostname, version, platform info
- `get_system_status` - Get system uptime, CPU, memory usage
- `get_interface_status` - Get interface link states

### Firewall Rules
- `list_firewall_rules` - List all firewall rules (optionally filter by interface)
- `create_firewall_rule` - Create a new firewall rule
- `update_firewall_rule` - Update an existing firewall rule
- `toggle_firewall_rule` - Enable or disable a firewall rule
- `delete_firewall_rule` - Delete a firewall rule (requires confirmation)
- `reorder_firewall_rules` - Reorder firewall rules

### NAT / Port Forwarding
- `list_port_forwards` - List NAT port forward rules
- `create_port_forward` - Create a port forward rule
- `delete_port_forward` - Delete a port forward rule (requires confirmation)

### Aliases
- `list_aliases` - List all firewall aliases
- `create_alias` - Create a firewall alias
- `update_alias` - Update an existing alias
- `delete_alias` - Delete an alias (requires confirmation)

### Interfaces
- `list_interfaces` - List all interface configurations
- `get_interface` - Get details for a specific interface

### Services
- `list_services_status` - List running services and their status
- `get_dhcp_leases` - Get the active **kea-dhcp4** lease table (the legacy isc-dhcpd backend is deprecated and unused)
- `get_dns_resolver` - Get DNS resolver configuration
- `update_dns_resolver` - Update DNS resolver settings
- `get_dhcp_server_config` - Get **kea-dhcp4** server configuration
- `create_dhcp_static_mapping` - Create a DHCP static mapping (reservation) ingested by **kea-dhcp4**

> **DHCP backend:** This pfSense+ firewall runs `kea-dhcp4` exclusively. All DHCP-related tools and references in this server must operate against kea state. Static reservations are still stored under `<dhcpd>/<iface>/<staticmap>` in `config.xml` (kea reads the same XML) but the runtime backend is kea, not isc-dhcpd.

### VPN
- `list_openvpn_servers` - List OpenVPN server instances
- `get_openvpn_status` - Get OpenVPN connection status
- `get_ipsec_status` - Get IPsec tunnel status
- `get_wireguard_status` - Get WireGuard tunnel status

### Diagnostics
- `get_arp_table` - Get ARP table
- `run_ping` - Ping a target host
- `run_traceroute` - Traceroute to a target host
- `get_firewall_states` - Get active firewall states
- `get_routing_table` - Get routing table

### Gateway
- `get_gateway_status` - Get gateway health and latency

## Destructive Operations

Operations that delete data require `confirm: true` to execute. This prevents accidental deletions.

## Resources

- `pfsense://system/info` - System information
- `pfsense://interfaces` - Interface configurations
- `pfsense://gateways/status` - Gateway health status
- `pfsense://services/status` - Service statuses
- `pfsense://firewall/rules/{interface}` - Firewall rules for a specific interface

## Prompts

- **diagnose-connectivity** - Diagnose network connectivity to a target
- **firewall-audit** - Audit firewall rules on an interface for security issues
- **vpn-setup** - Guide through VPN configuration
