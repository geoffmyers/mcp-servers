# CLAUDE.md - Portainer MCP Server

## Project Overview
MCP server for managing Docker environments via the Portainer CE/EE REST API. Provides 36 tools, 5 resources, and 3 prompts for stacks, containers, images, volumes, networks, registries, users/teams, and templates management.

## Architecture / Key Files
- `src/index.ts` - Entry point, transport selection (stdio or streamableHttp)
- `src/server/index.ts` - Server factory, McpServer setup, loads instructions.md
- `src/lib/portainer-client.ts` - REST client with API key (X-API-KEY header) or JWT auth
- `src/lib/errors.ts` - PortainerError class + formatErrorForMcp()
- `src/tools/` - 10 tool modules (36 tools total):
  - `system.ts` - get_system_info, get_system_status
  - `environments.ts` - list_environments
  - `stacks.ts` - list/create/update/delete/start/stop stacks, get_stack_file
  - `containers.ts` - list/inspect/start/stop/restart/remove containers, get_container_logs
  - `images.ts` - list/pull/remove/prune images
  - `volumes.ts` - list/create/remove volumes
  - `networks.ts` - list/create/remove networks
  - `registries.ts` - list/create/update registries
  - `users-teams.ts` - list users/teams, update user role, create team, update team members
  - `templates.ts` - list_templates
- `src/resources/` - 3 resource modules (system info, environments, stacks) providing 5 URIs
- `src/prompts/` - 3 prompt modules (deploy-stack, troubleshoot-container, environment-overview)
- `.env.tpl` - 1Password template: PORTAINER_HOST, PORTAINER_API_KEY
- `Dockerfile` - Container build support
- `tsconfig.json` - TypeScript configuration

## Development Commands
- `npm install` - Install dependencies
- `npm run build` - Build TypeScript to dist/, copy docs, chmod +x
- `npm run watch` - TypeScript watch mode
- `npm run start:stdio` - Start with stdio transport
- `npm run start:streamableHttp` - Start with HTTP transport (port 3002)
- `npm test` - Run tests with vitest
- `npm run test:watch` - Run tests in watch mode

## Tool Categories (36 tools)
| Category | Count | Tools |
|----------|-------|-------|
| System | 2 | get_system_info, get_system_status |
| Environments | 1 | list_environments |
| Stacks | 7 | list/create/update/delete/start/stop stacks, get_stack_file |
| Containers | 7 | list/inspect/start/stop/restart/remove containers, get_container_logs |
| Images | 4 | list/pull/remove/prune images |
| Volumes | 3 | list/create/remove volumes |
| Networks | 3 | list/create/remove networks |
| Registries | 3 | list/create/update registries |
| Users & Teams | 5 | list users/teams, update user role, create team, update team members |
| Templates | 1 | list_templates |

## Resources (5)
- `portainer://system/info` - System information and version
- `portainer://environments` - All managed environments
- `portainer://environment/{id}` - Specific environment by ID
- `portainer://stacks` - All stacks
- `portainer://stack/{id}` - Specific stack by ID

## Prompts (3)
- `deploy-stack` - Guided deployment of a Docker Compose stack
- `troubleshoot-container` - Diagnose and troubleshoot container issues
- `environment-overview` - Generate a status report for an environment

## Common Tasks
- **Add a new tool**: Create a new file in `src/tools/` or add to existing module, register in `src/tools/index.ts`
- **Add a new resource**: Create file in `src/resources/`, register in `src/resources/index.ts`
- **Add a new prompt**: Create file in `src/prompts/`, register in `src/prompts/index.ts`
- **Test locally**: `npm run build && PORTAINER_HOST=... PORTAINER_API_KEY=... node dist/index.js stdio`
- **Generate .env**: `op inject -i .env.tpl -o .env`

## Gotchas
- Default HTTP port is 3002 (override with PORT env var)
- Requires PORTAINER_HOST and either PORTAINER_API_KEY or PORTAINER_USERNAME + PORTAINER_PASSWORD
- Supports two auth methods: API key (X-API-KEY header) or JWT (auto-refreshes on 401)
- Self-signed TLS certificates are accepted by default (PORTAINER_VERIFY_SSL=false)
- Set PORTAINER_SECURE=false to use plain HTTP instead of HTTPS
- Most container/image/volume/network operations require `environmentId` parameter
- Destructive operations (delete_stack, remove_container, remove_image, prune_images, remove_volume, remove_network) require `confirm: true`
- Build step copies `docs/` into `dist/docs/` for runtime instruction loading
- Credentials managed via 1Password CLI (vault: <vault>, item: portainer-mcp)
