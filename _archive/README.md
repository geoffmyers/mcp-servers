# Archived MCP servers

These local TypeScript MCP servers were archived 2026-06-17. They are **not wired
into any active config**:

- `pfsense-mcp-server` — pfSense+ REST API v2 (33 tools)
- `truenas-mcp-server` — TrueNAS SCALE WebSocket API (45 tools)
- `unifi-mcp-server` — UniFi Network REST API (34 tools)

The live Claude Code config (`.mcp.json`) uses the CLI-based variants
(`pfsense-cli`, `truenas-cli`, `unifi-cli`). The Claude Desktop config
(`claude-mcp-config/claude_desktop_config.json`) reaches pfSense/TrueNAS/UniFi via
external `uvx`/`npx` packages, not these local dirs.

They retain real, built implementations (incl. REST/WebSocket *write* coverage the
CLI variants lack). Unarchive and re-add to the workspace + a config if a
REST/write transport is needed. See
[`docs/plans/2026-06-17-monorepo-consolidation-strategy.md`](../../docs/plans/2026-06-17-monorepo-consolidation-strategy.md).
