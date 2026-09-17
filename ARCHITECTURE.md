# Architecture

An **npm workspace**: one repository holding many small Model Context Protocol
servers, plus one Python server that stands apart.

## Shape

| Path | What lives there |
|---|---|
| `mcp-server-shared/` | `@geoffmyers/mcp-server-shared` — the common runtime every TypeScript server depends on: server factory, CLI runner, HTTP transport, shared error handling. |
| `<name>-mcp-server/` | One directory per server. Each has `src/index.ts` (CLI entry), `src/server/` (factory), `src/tools/` (one file per tool) and its own `.env.example`. |
| `remote-desktop-mcp-server/` | The odd one out: Python, driving VNC via `asyncvnc`. |

## The pattern

Two families. **CLI wrappers** (`docker`, `find`, `grep`, `sed`, `rsync`,
`xargs`, `nmap`) expose an existing command with structured input and output and
a safety rail — destructive operations require an explicit confirmation flag.
**Service clients** (`portainer`, `truenas`, `pfsense`, `unifi`, `zigbee2mqtt`,
`zwavejs`, `homeassistant`, `esphome`, `markdown-rag`) talk to a system over its
own API, MQTT or SSH.

A new server copies an existing one, depends on `mcp-server-shared`, and uses
`runCli()` in `src/index.ts` with `createServerFactory()` in `src/server/`. The
`prepare` script belongs only to the shared package.

## Configuration

Servers read their settings from environment variables only; nothing loads a
`.env` file for them. Each server's `.env.example` lists the variables with
placeholders: pass them in the MCP client's `env` block, or start the server
with `node --env-file=<server>/.env`. The operator's real templates are
excluded from the published snapshot deliberately, since they carry live
hostnames.
