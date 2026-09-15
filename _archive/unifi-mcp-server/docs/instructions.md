---
title: UniFi MCP Server
created: 2026-01-30
modified: 2026-01-30
description: "This MCP server provides access to the UniFi Network REST API for managing clients, devices, networks, WLANs, firewall rules, and more."
tags: [mcp-servers]
---

# UniFi MCP Server

This MCP server provides access to the UniFi Network REST API for managing clients, devices, networks, WLANs, firewall rules, and more.

## Available Tools

### System
- `get_system_info` - Get controller version and uptime
- `create_backup` - Generate a controller backup (requires confirmation)

### Sites
- `list_sites` - List all configured sites

### Clients
- `list_active_clients` - List currently connected clients
- `get_client` - Get details for a specific client by MAC address
- `block_client` - Block a client device
- `unblock_client` - Unblock a client device
- `reconnect_client` - Force a client to reconnect
- `forget_client` - Remove a client from the controller (requires confirmation)
- `authorize_guest` - Authorize a guest client

### Devices
- `list_devices` - List all adopted devices
- `get_device` - Get details for a specific device by MAC address
- `restart_device` - Reboot a device (requires confirmation)
- `adopt_device` - Adopt a new device
- `locate_device` - Toggle the locate LED on a device
- `upgrade_device` - Upgrade device firmware (requires confirmation)

### Networks
- `list_networks` - List all networks and VLANs
- `get_network` - Get a specific network configuration
- `create_network` - Create a new network
- `update_network` - Update a network configuration
- `delete_network` - Delete a network (requires confirmation)

### WLANs
- `list_wlans` - List all wireless networks
- `create_wlan` - Create a new wireless network
- `update_wlan` - Update a wireless network
- `delete_wlan` - Delete a wireless network (requires confirmation)

### Firewall
- `list_firewall_rules` - List firewall rules
- `create_firewall_rule` - Create a firewall rule
- `delete_firewall_rule` - Delete a firewall rule (requires confirmation)

### Events & Alarms
- `list_events` - List recent events
- `list_alarms` - List active alarms

### Guests
- `create_voucher` - Generate guest vouchers
- `list_vouchers` - List existing vouchers

### DPI
- `get_dpi_stats` - Get Deep Packet Inspection statistics

### DNS
- `list_dns_records` - List DNS records

## Destructive Operations

Operations that delete data or restart devices require `confirm: true` to execute.

## Resources

- `unifi://system/info` - Controller system information
- `unifi://sites` - All configured sites
- `unifi://devices` - All adopted devices with status
- `unifi://clients/active` - Currently connected clients

## Prompts

- **network-health** - Comprehensive network health check
- **client-troubleshoot** - Troubleshoot a specific client's connectivity
- **wifi-optimization** - Analyze WiFi setup for optimization opportunities
