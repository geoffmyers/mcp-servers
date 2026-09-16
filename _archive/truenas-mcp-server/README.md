# TrueNAS SCALE MCP Server

A [Model Context Protocol](https://modelcontextprotocol.io/) (MCP) server for managing TrueNAS SCALE systems via the WebSocket JSON-RPC API. Provides 44 tools, 7 resources, and 3 prompts for comprehensive NAS management from any MCP-compatible client (Claude Desktop, Claude Code, etc.).

## Prerequisites

- Node.js 22+
- TrueNAS SCALE system with API key configured
- API key generated via TrueNAS UI → Settings → API Keys

## Installation

```bash
cd mcp-servers/truenas-mcp-server
npm install
npm run build
```

## Configuration

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `TRUENAS_HOST` | Yes | TrueNAS hostname or IP with port (e.g., `truenas.local:443`) |
| `TRUENAS_API_KEY` | Yes | API key from TrueNAS UI |
| `TRUENAS_SECURE` | No | Set to `false` to use WS instead of WSS (default: `true`) |
| `TRUENAS_VERIFY_SSL` | No | Set to `true` to verify SSL certificates (default: `false`) |
| `PORT` | No | HTTP transport port (default: `3001`) |

### 1Password Integration

Generate `.env` from the template:

```bash
op inject -i .env.tpl -o .env
```

### Claude Desktop Configuration

```json
{
  "mcpServers": {
    "truenas": {
      "command": "node",
      "args": ["/path/to/mcp-servers/truenas-mcp-server/dist/index.js", "stdio"],
      "env": {
        "TRUENAS_HOST": "truenas.local",
        "TRUENAS_API_KEY": "your-api-key"
      }
    }
  }
}
```

### Claude Code Configuration

```json
{
  "mcpServers": {
    "truenas": {
      "command": "node",
      "args": ["/path/to/mcp-servers/truenas-mcp-server/dist/index.js", "stdio"],
      "env": {
        "TRUENAS_HOST": "truenas.local",
        "TRUENAS_API_KEY": "your-api-key"
      }
    }
  }
}
```

## Transports

| Transport | Command | Use Case |
|-----------|---------|----------|
| **stdio** | `node dist/index.js stdio` | Claude Desktop, Claude Code, local clients |
| **Streamable HTTP** | `node dist/index.js streamableHttp` | Remote clients, multi-session (port 3001) |

## Tools (43)

### System (3)

| Tool | Description | Parameters |
|------|-------------|------------|
| `get_system_info` | System version, hostname, uptime, hardware details | — |
| `reboot_system` | Reboot the system | `confirm` |
| `shutdown_system` | Shut down the system | `confirm` |

### Storage Pools (2)

| Tool | Description | Parameters |
|------|-------------|------------|
| `list_pools` | List all ZFS storage pools | — |
| `get_pool_status` | Detailed pool status by ID | `id` |

### Datasets (5)

| Tool | Description | Parameters |
|------|-------------|------------|
| `list_datasets` | List all ZFS datasets | — |
| `get_dataset` | Get dataset details by path | `id` |
| `create_dataset` | Create a ZFS dataset | `name`, `type?`, `comments?`, `compression?`, `quota?`, `refquota?`, `atime?`, `exec?` |
| `update_dataset` | Update dataset properties | `id`, `comments?`, `compression?`, `quota?`, `refquota?`, `atime?`, `exec?` |
| `delete_dataset` | Delete a dataset | `id`, `confirm` |

### Snapshots (5)

| Tool | Description | Parameters |
|------|-------------|------------|
| `list_snapshots` | List all ZFS snapshots | — |
| `create_snapshot` | Create a snapshot | `dataset`, `name`, `recursive?` |
| `delete_snapshot` | Delete a snapshot | `id`, `confirm` |
| `rollback_snapshot` | Rollback dataset to snapshot | `id`, `confirm`, `force?`, `recursive?`, `recursive_clones?` |
| `clone_snapshot` | Clone snapshot to new dataset | `snapshot`, `dataset_dst` |

### SMB Shares (3)

| Tool | Description | Parameters |
|------|-------------|------------|
| `list_smb_shares` | List all SMB shares | — |
| `create_smb_share` | Create an SMB share | `path`, `name`, `comment?`, `ro?`, `browsable?`, `guestok?` |
| `delete_smb_share` | Delete an SMB share | `id`, `confirm` |

### NFS Exports (3)

| Tool | Description | Parameters |
|------|-------------|------------|
| `list_nfs_exports` | List all NFS exports | — |
| `create_nfs_export` | Create an NFS export | `path`, `comment?`, `networks?`, `hosts?`, `ro?`, `maproot_user?`, `maproot_group?` |
| `delete_nfs_export` | Delete an NFS export | `id`, `confirm` |

### iSCSI (4)

| Tool | Description | Parameters |
|------|-------------|------------|
| `list_iscsi_targets` | List iSCSI targets | — |
| `create_iscsi_target` | Create an iSCSI target | `name`, `alias?` |
| `list_iscsi_extents` | List iSCSI extents | — |
| `create_iscsi_extent` | Create an iSCSI extent | `name`, `type`, `disk?`, `path?`, `filesize?` |

### Services (4)

| Tool | Description | Parameters |
|------|-------------|------------|
| `list_services` | List all services and status | — |
| `start_service` | Start a service | `name` |
| `stop_service` | Stop a service | `name` |
| `restart_service` | Restart a service | `name` |

### Apps (4)

| Tool | Description | Parameters |
|------|-------------|------------|
| `list_apps` | List installed applications | — |
| `start_app` | Start an application | `name` |
| `stop_app` | Stop an application | `name` |
| `upgrade_app` | Upgrade an application | `name` |

### Virtual Machines (3)

| Tool | Description | Parameters |
|------|-------------|------------|
| `list_vms` | List all VMs | — |
| `start_vm` | Start a VM | `id` |
| `stop_vm` | Stop a VM | `id`, `force?` |

### Users (4)

| Tool | Description | Parameters |
|------|-------------|------------|
| `list_users` | List all users | — |
| `create_user` | Create a user | `username`, `full_name`, `password`, `group_create?`, `shell?`, `home?`, `email?` |
| `update_user` | Update a user | `id`, `username?`, `full_name?`, `password?`, `shell?`, `home?`, `email?`, `locked?` |
| `delete_user` | Delete a user | `id`, `confirm` |

### Replication (2)

| Tool | Description | Parameters |
|------|-------------|------------|
| `list_replications` | List replication tasks | — |
| `run_replication` | Trigger a replication task | `id` |

### Snapshot Tasks (2)

| Tool | Description | Parameters |
|------|-------------|------------|
| `list_snapshot_tasks` | List periodic snapshot tasks | — |
| `create_snapshot_task` | Create a snapshot schedule | `dataset`, `recursive`, `lifetime_value`, `lifetime_unit`, `naming_schema?`, `schedule?` |

## Resources (7)

| URI | Description |
|-----|-------------|
| `truenas://system/info` | System version, hostname, hardware |
| `truenas://pools` | All ZFS storage pools |
| `truenas://pool/{name}` | Specific pool by name |
| `truenas://datasets` | All ZFS datasets |
| `truenas://dataset/{id}` | Specific dataset by path |
| `truenas://alerts` | Active system alerts |
| `truenas://services` | All services and status |

## Prompts (3)

| Prompt | Arguments | Description |
|--------|-----------|-------------|
| `storage-report` | — | Comprehensive storage usage report with pool health, space utilization, growth trends |
| `plan-backup` | `datasetPath` | Design a backup strategy for a dataset with snapshot schedules and replication |
| `diagnose-pool` | `poolName` | Diagnose pool health, VDEV layout, disk errors, fragmentation |

## Safety

Destructive operations (`delete_dataset`, `delete_snapshot`, `rollback_snapshot`, `delete_smb_share`, `delete_nfs_export`, `delete_user`, `reboot_system`, `shutdown_system`) require `confirm: true` to execute.

## Docker

```bash
docker build -t mcp-server-truenas .
docker run -e TRUENAS_HOST=truenas.local -e TRUENAS_API_KEY=key mcp-server-truenas
```

## Architecture

```
src/
  index.ts              # Entry point (transport selection)
  server/index.ts       # Server factory (McpServer setup)
  lib/
    truenas-client.ts   # WebSocket JSON-RPC 2.0 client
    errors.ts           # TrueNASError + formatErrorForMcp()
  tools/                # 13 tool modules (44 tools)
  resources/            # 6 resource modules (7 resources)
  prompts/              # 3 prompt modules
  transports/
    stdio.ts            # stdio transport
    streamableHttp.ts   # Express-based HTTP transport
```

## License

MIT
