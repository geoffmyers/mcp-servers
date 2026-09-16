# Rsync MCP Server

This server provides tools to synchronize files and directories using the `rsync` command.

## Available Tools

- **rsync_dry_run** - Preview an rsync transfer without making any changes (always uses --dry-run)
- **rsync_execute** - Execute an rsync file transfer (requires explicit confirmation)

## Safety

- Always use `rsync_dry_run` first to preview what will be transferred before executing
- The `rsync_execute` tool requires `confirm: true` to proceed
- Archive mode (-a) is enabled by default for safe, complete transfers

## Usage Tips

- Use `exclude` to skip directories like `node_modules`, `.git`, `__pycache__`
- Use `include` with `exclude` for selective sync (include patterns are evaluated before exclude patterns)
- Enable `compress` (-z) for remote transfers to reduce bandwidth
- Use `delete` cautiously -- it removes files at the destination that don't exist at the source
- Trailing slash on source matters: `src/` syncs contents, `src` syncs the directory itself
- For remote paths use the format `user@host:/path/to/dir`

## Prompt

- **backup-plan** - Interactive prompt to plan and execute a backup strategy with rsync
