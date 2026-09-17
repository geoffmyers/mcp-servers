# CLAUDE.md - ESPHome CLI MCP Server

## Project Overview
MCP server wrapping the ESPHome CLI for device configuration management, firmware compilation, and log monitoring. Supports local or SSH execution via `@geoffmyers/mcp-server-shared`. Provides 10 tools, 1 resource, and 1 prompt.

## Architecture / Key Files
- `src/index.ts` - Entry point, transport selection (stdio or streamableHttp)
- `src/server/index.ts` - Server factory, McpServer setup, loads instructions.md
- `src/lib/esphome.ts` - `executeEsphome()` helper that routes esphome CLI calls through `docker exec`
- `src/tools/devices.ts` - Device tools: list, config, logs
- `src/tools/build.ts` - Build tools: compile, upload, clean
- `src/tools/management.ts` - Management tools: rename device, discover devices
- `src/tools/utility.ts` - Utility tools: validate config, version
- `src/tools/index.ts` - Tool registration
- `src/resources/index.ts` - Resources: esphome://devices
- `src/prompts/device-troubleshoot.ts` - Device troubleshooting prompt
- `docs/instructions.md` - Server instructions bundled into dist/
- `.env.tpl` - Environment configuration (EXECUTION_MODE, SSH_HOST, ESPHOME_CONFIG_DIR, ESPHOME_CONTAINER)

## Development Commands
- `npm install` - Install dependencies
- `npm run build` - Build TypeScript to dist/, copy docs, chmod +x
- `npm run watch` - TypeScript watch mode
- `npm run start:stdio` - Start with stdio transport
- `npm run start:streamableHttp` - Start with HTTP transport (port 3022)

## Key Concepts
- The `esphome` binary lives inside the ESPHome container (standalone docker-compose deployment), not on the host
- `executeEsphome()` in `src/lib/esphome.ts` wraps all `esphome` CLI calls with `docker exec <container>`
- The effective command is: `docker exec <container> esphome <args>` (or via SSH when EXECUTION_MODE=ssh)
- `list_devices` and the `esphome://devices` resource run `ls` inside the ESPHome container via `executeInContainer()` so the same `ESPHOME_CONFIG_DIR` (the container's view of the config dir) works for every tool. Running `ls` on the host is only correct when host and container paths happen to match, which is not guaranteed (e.g. a host path such as `/srv/esphome` that the container sees as `/config`).
- `ESPHOME_CONTAINER` env var controls the container name (default: `esphome` for the standalone deployment; HAOS add-on installs use `addon_5c53de3b_esphome`)

## Gotchas
- Default HTTP port is 3022 (override with PORT env var)
- Defaults assume the standalone docker-compose deployment (`ESPHOME_CONFIG_DIR=/config`, `ESPHOME_CONTAINER=esphome`).
- For legacy HAOS add-on deployments override with `ESPHOME_CONTAINER=addon_5c53de3b_esphome`, `ESPHOME_CONFIG_DIR=/config/esphome`, `EXECUTION_MODE=ssh`, `SSH_HOST=root@<homeassistant-host>`.
- `upload_device`, `clean_build`, and `rename_device` require `confirm: true`
- Device names are derived from YAML config filenames in the config directory
- The add-on container ID (`5c53de3b`) is specific to a given HAOS install and may differ across installations
