---
title: TrueNAS SCALE MCP Server
created: 2026-01-30
modified: 2026-01-30
description: This server provides tools for managing a TrueNAS SCALE system via its WebSocket API.
tags: [mcp-servers]
---

# TrueNAS SCALE MCP Server

This server provides tools for managing a TrueNAS SCALE system via its WebSocket API.

## Available Operations

### Storage
- **Pools**: List pools, check pool health and disk status
- **Datasets**: Full CRUD on ZFS datasets (create, read, update, delete)
- **Snapshots**: Create, list, delete, rollback, and clone ZFS snapshots
- **Snapshot Tasks**: List and create automated snapshot schedules
- **Replication**: List and trigger replication tasks

### Sharing
- **SMB**: Create, list, and delete SMB/CIFS shares
- **NFS**: Create, list, and delete NFS exports
- **iSCSI**: Create and list iSCSI targets and extents

### System
- **Info**: System hostname, version, uptime, hardware details
- **Services**: List, start, stop, and restart system services
- **Apps**: List, start, stop, and upgrade installed applications
- **VMs**: List, start, and stop virtual machines
- **Users**: Create, list, update, and delete local users

## Safety

Destructive operations (delete, reboot, shutdown, rollback) require explicit `confirm: true` parameter to prevent accidental execution.

## Authentication

Requires `TRUENAS_HOST` and `TRUENAS_API_KEY` environment variables. Generate an API key in TrueNAS UI under Settings > API Keys.
