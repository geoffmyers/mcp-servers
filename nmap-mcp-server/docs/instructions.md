---
title: Nmap MCP Server
created: 2026-01-31
modified: 2026-01-31
description: This MCP server provides network scanning capabilities using the nmap command-line tool.
tags: [mcp-servers]
---

# Nmap MCP Server

This MCP server provides network scanning capabilities using the `nmap` command-line tool.

## Available Tools

### nmap_ping_scan
Host discovery scan using `-sn`. Finds live hosts on a network without performing a port scan. Useful for quickly identifying which hosts are online in a subnet.

### nmap_port_scan
TCP connect port scan (`-sT`) with optional service version detection (`-sV`). Allows specifying individual ports, ranges, or a combination. This scan type does not require root privileges.

### nmap_os_detection
OS fingerprinting scan using `-O`. Attempts to determine the operating system running on the target host. May require elevated privileges to function correctly.

### nmap_quick_scan
Fast scan using `-F`. Scans the top 100 most common ports instead of the default 1000, providing faster results when a full scan is not needed.

## Target Specification

All tools accept a `target` parameter which supports standard nmap target formats:
- Single IP: `192.0.2.1`
- Hostname: `example.com`
- CIDR range: `192.0.2.0/24`
- IP range: `192.0.2.1-254`
- Multiple targets: `192.0.2.1 192.0.2.2`

## Notes

- The default command timeout is 120 seconds. Override with the `timeout` parameter (in milliseconds).
- Some scan types (OS detection) may require root/sudo privileges.
- Only TCP connect scans (`-sT`) are supported to avoid requiring raw socket privileges.
