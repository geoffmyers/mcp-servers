# pfSense CLI MCP Server

This server provides tools for managing and monitoring a pfSense firewall via CLI commands executed over SSH.

## Available Operations

### System
- Get system information (hostname, kernel, uptime)
- Reboot the system (requires confirmation)

### Firewall
- List active firewall rules (pfctl)
- View firewall states
- View firewall state statistics/counters

### Interfaces
- List all network interfaces
- View interface statistics via pfctl

### Gateways
- View gateway status

### Services
- List running services
- Restart a service (requires confirmation)
- View **kea-dhcp4** lease table (active leases only). The legacy isc-dhcpd backend is **deprecated and unused** on this firewall — its `/var/dhcpd/var/db/dhcpd.leases` file is stale and must never be relied on.
- Check DNS resolver status

### Network
- View ARP table
- View routing table

### VPN
- View OpenVPN status
- View IPsec status
- View WireGuard status

### Diagnostics
- Ping a host
- Traceroute to a host
- List installed packages
- Backup configuration (read config.xml)

## Safety

Destructive operations (reboot, restart service) require explicit `confirm: true` parameter.

## Execution

Commands run via SSH to the pfSense host as configured in the environment.
