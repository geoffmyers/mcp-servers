# TrueNAS SCALE CLI MCP Server

This server provides tools for managing TrueNAS SCALE via the `midclt` CLI, which communicates directly with the TrueNAS middleware.

## Available Operations

### System
- Get system information
- Reboot or shutdown the system (requires confirmation)

### Pools
- List all storage pools
- Get status of a specific pool

### Datasets
- List, get, create, delete datasets

### Snapshots
- List, create, delete, rollback snapshots

### SMB Sharing
- List, create, delete SMB shares

### NFS Sharing
- List, create, delete NFS exports

### Services
- List all services with status
- Start, stop, restart, reload services (via `service.control`). A failure is reported from the job's result, not its exit code. RELOAD keeps connections only for services the middleware marks reloadable (e.g. ssh, cifs, nfs, ftp); for any other service, `ups` included, it is a full restart with that service's side effects.

### Apps
- List installed apps
- Start, stop apps

### Alerts
- List active alerts
- Dismiss alerts

## Safety

Destructive operations (delete, reboot, shutdown, rollback) require explicit `confirm: true` parameter.

## Execution

Commands run either locally or via SSH depending on configuration. All commands use `midclt call <method>` which returns JSON directly from the TrueNAS middleware API.
