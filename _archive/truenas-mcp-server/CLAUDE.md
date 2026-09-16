# CLAUDE.md - TrueNAS SCALE MCP Server

## Project Overview
MCP server for managing TrueNAS SCALE systems via the WebSocket JSON-RPC API. Provides 44 tools, 7 resources, and 3 prompts for ZFS pools, datasets, snapshots, SMB/NFS/iSCSI shares, services, apps, VMs, users, replication, and snapshot tasks.

## Architecture / Key Files
- `src/index.ts` - Entry point, transport selection (stdio or streamableHttp)
- `src/server/index.ts` - Server factory, McpServer setup, loads instructions.md
- `src/lib/truenas-client.ts` - WebSocket JSON-RPC 2.0 client with API key auth
- `src/lib/errors.ts` - TrueNASError class + formatErrorForMcp()
- `src/tools/` - 13 tool modules (44 tools total):
  - `system.ts` - get_system_info, reboot_system, shutdown_system
  - `pool.ts` - list_pools, get_pool_status
  - `dataset.ts` - list/get/create/update/delete datasets
  - `snapshot.ts` - list/create/delete/rollback/clone snapshots
  - `sharing-smb.ts` - list/create/delete SMB shares
  - `sharing-nfs.ts` - list/create/delete NFS exports
  - `sharing-iscsi.ts` - list/create iSCSI targets and extents
  - `service.ts` - list/start/stop/restart services
  - `app.ts` - list/start/stop/upgrade apps
  - `vm.ts` - list/start/stop VMs
  - `user.ts` - list/create/update/delete users
  - `replication.ts` - list/run replication tasks
  - `snapshot-task.ts` - list/create periodic snapshot tasks
- `src/resources/` - 6 resource modules (system info, pools, datasets, alerts, services) providing 7 URIs
- `src/prompts/` - 3 prompt modules (storage-report, plan-backup, diagnose-pool)
- `.env.tpl` - 1Password template: TRUENAS_HOST, TRUENAS_API_KEY
- `Dockerfile` - Container build support
- `tsconfig.json` - TypeScript configuration

## Development Commands
- `npm install` - Install dependencies
- `npm run build` - Build TypeScript to dist/, copy docs, chmod +x
- `npm run watch` - TypeScript watch mode
- `npm run start:stdio` - Start with stdio transport
- `npm run start:streamableHttp` - Start with HTTP transport (port 3001)
- `npm test` - Run tests with vitest
- `npm run test:watch` - Run tests in watch mode

## Tool Categories (44 tools)
| Category | Count | Tools |
|----------|-------|-------|
| System | 3 | get_system_info, reboot_system, shutdown_system |
| Storage Pools | 2 | list_pools, get_pool_status |
| Datasets | 5 | list/get/create/update/delete datasets |
| Snapshots | 5 | list/create/delete/rollback/clone snapshots |
| SMB Shares | 3 | list/create/delete SMB shares |
| NFS Exports | 3 | list/create/delete NFS exports |
| iSCSI | 4 | list/create iSCSI targets and extents |
| Services | 4 | list/start/stop/restart services |
| Apps | 4 | list/start/stop/upgrade apps |
| VMs | 3 | list/start/stop VMs |
| Users | 4 | list/create/update/delete users |
| Replication | 2 | list/run replication tasks |
| Snapshot Tasks | 2 | list/create periodic snapshot tasks |

## Resources (7)
- `truenas://system/info` - System version, hostname, hardware
- `truenas://pools` - All ZFS storage pools
- `truenas://pool/{name}` - Specific pool by name
- `truenas://datasets` - All ZFS datasets
- `truenas://dataset/{id}` - Specific dataset by path
- `truenas://alerts` - Active system alerts
- `truenas://services` - All services and status

## Prompts (3)
- `storage-report` - Comprehensive storage usage report with pool health
- `plan-backup` - Design a backup strategy for a dataset
- `diagnose-pool` - Diagnose pool health, VDEV layout, disk errors

## Common Tasks
- **Add a new tool**: Create a new file in `src/tools/` or add to existing module, register in `src/tools/index.ts`
- **Add a new resource**: Create file in `src/resources/`, register in `src/resources/index.ts`
- **Add a new prompt**: Create file in `src/prompts/`, register in `src/prompts/index.ts`
- **Test locally**: `npm run build && TRUENAS_HOST=... TRUENAS_API_KEY=... node dist/index.js stdio`
- **Generate .env**: `op inject -i .env.tpl -o .env`

## Gotchas
- Default HTTP port is 3001 (override with PORT env var)
- Requires TRUENAS_HOST and TRUENAS_API_KEY environment variables
- Uses WebSocket JSON-RPC 2.0 protocol (not REST), connecting via WSS by default
- Set TRUENAS_SECURE=false to use WS instead of WSS
- Self-signed TLS certificates are accepted by default (TRUENAS_VERIFY_SSL=false)
- Has `ws` as a runtime dependency (WebSocket client library)
- Destructive operations (delete_dataset, delete_snapshot, rollback_snapshot, delete_smb_share, delete_nfs_export, delete_user, reboot_system, shutdown_system) require `confirm: true`
- Build step copies `docs/` into `dist/docs/` for runtime instruction loading
- Credentials managed via 1Password CLI (vault: <vault>, item: truenas-mcp)
