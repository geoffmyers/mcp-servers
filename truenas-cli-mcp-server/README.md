# TrueNAS SCALE CLI MCP Server

## Overview
A [Model Context Protocol](https://modelcontextprotocol.io/) (MCP) server for [TrueNAS SCALE](https://www.truenas.com/truenas-scale/). Every tool runs `midclt call <method>`, which talks to the TrueNAS middleware and returns JSON, either on the TrueNAS host itself or over SSH.

## Requirements
- Node.js 20.6+
- TrueNAS SCALE with `midclt` (every current release ships it)
- If the server runs elsewhere: key-based SSH access to the TrueNAS host as a user allowed to run `midclt` (an administrator account)

## Installation
From the repository root (the servers are one npm workspace):

```bash
npm ci
npm run build
```

## Configuration

### MCP client
```json
{
  "mcpServers": {
    "truenas-cli": {
      "command": "node",
      "args": ["/path/to/mcp-servers/truenas-cli-mcp-server/dist/index.js", "stdio"]
    }
  }
}
```

Run `node dist/index.js streamableHttp` instead to serve streamable HTTP on port 3023.

### Environment variables
| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `EXECUTION_MODE` | No | `local` | `local` runs commands on this machine; `ssh` runs them on `SSH_HOST` |
| `SSH_HOST` | When `EXECUTION_MODE=ssh` | — | Host (or SSH config alias) to run commands on, with key-based login |
| `PORT` | No | `3023` | Port for the streamable HTTP transport |

`.env.example` lists them; `node --env-file=.env dist/index.js stdio` loads a filled-in copy.

## Tools

44 tools; 8 of them change something and require `confirm: true` (`system_reboot`, `system_shutdown`, `delete_dataset`, `delete_snapshot`, `rollback_snapshot`, `delete_smb_share`, `delete_nfs_export`, `delete_user`).

| Tool | Description |
|------|-------------|
| `system_info` | Get TrueNAS SCALE system information (hostname, version, uptime, etc.) |
| `system_reboot` | Reboot the TrueNAS SCALE system (requires confirm: true) |
| `system_shutdown` | Shut down the TrueNAS SCALE system (requires confirm: true) |
| `list_pools` | List all ZFS storage pools |
| `pool_status` | Get the status of a specific ZFS pool by name |
| `start_scrub` | Start a pool scrub |
| `stop_scrub` | Stop a running pool scrub |
| `scrub_status` | Get scrub status for pools |
| `list_datasets` | List ZFS datasets. Use pool filter for large systems. Returns nested dataset trees. |
| `get_dataset` | Get details of a specific dataset by ID |
| `create_dataset` | Create a new ZFS dataset |
| `delete_dataset` | Delete a ZFS dataset (requires confirm: true) |
| `update_dataset` | Update dataset properties |
| `list_snapshots` | List ZFS snapshots. Use dataset or pool filter to avoid timeouts on systems with many snapshots. Use count_only to get total count. |
| `create_snapshot` | Create a ZFS snapshot |
| `delete_snapshot` | Delete a ZFS snapshot (requires confirm: true) |
| `rollback_snapshot` | Rollback a dataset to a ZFS snapshot (requires confirm: true) |
| `list_smb_shares` | List all SMB shares |
| `create_smb_share` | Create a new SMB share |
| `delete_smb_share` | Delete an SMB share (requires confirm: true) |
| `list_nfs_exports` | List all NFS exports |
| `create_nfs_export` | Create a new NFS export |
| `delete_nfs_export` | Delete an NFS export (requires confirm: true) |
| `list_services` | List all services with their status |
| `start_service` | Start a service |
| `stop_service` | Stop a service |
| `restart_service` | Restart a service |
| `reload_service` | Reload a service. A true in-place reload (connections kept) ONLY for services the middleware marks reloadable, such as ssh, cifs, nfs and ftp. For any other service, ups included, RELOAD performs a FULL RESTART with that service's side effects. Prefer this over restart_service for ssh. |
| `list_apps` | List all installed apps |
| `start_app` | Start an installed app |
| `stop_app` | Stop a running app |
| `list_alerts` | List all active alerts |
| `dismiss_alert` | Dismiss an alert by ID |
| `list_disks` | List all disks in the system |
| `disk_smart_data` | Get SMART data for a disk |
| `identify_disk` | Blink disk LED to physically identify a disk |
| `list_users` | List all users on the system |
| `create_user` | Create a new user account |
| `update_user` | Update an existing user account |
| `delete_user` | Delete a user account (requires confirm: true) |
| `list_cron_jobs` | List all cron jobs |
| `create_cron_job` | Create a new cron job |
| `run_cron_job` | Run a cron job immediately |
| `list_boot_envs` | List all boot environments |

## Resources
| URI | Description |
|-----|-------------|
| `truenas-cli://system/info` | TrueNAS SCALE system information |
| `truenas-cli://pools` | List of all ZFS storage pools |
| `truenas-cli://alerts` | List of all active alerts |

## Prompts
| Prompt | Description |
|--------|-------------|
| `storage-report` | Generate a comprehensive storage health report for TrueNAS SCALE |
| `diagnose-pool` | Diagnose the health and status of a specific ZFS pool |

## Safety
- Destructive tools (delete, rollback, reboot, shutdown) require an explicit `confirm: true` argument.
- Commands run through `execFile` with argument arrays, so tool arguments are never interpolated into a local shell string.
- A service action's failure is read from the middleware job's result, not only from the command's exit code.

## Author
Geoff Myers
