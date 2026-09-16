# Find MCP Server

This server provides tools to search for files and directories using the `find` command.

## Available Tools

- **find_files** - Find files by name pattern, type, size, modification time
- **find_by_content** - Find files containing specific text
- **find_duplicates** - Find potential duplicate files by size

## Safety

All operations are read-only. No file deletion or modification is supported.

## Usage Tips

- Use `name` with glob patterns like `*.ts` or `*.log`
- Use `type` to filter: `f` for files, `d` for directories, `l` for symlinks
- Use `size` with prefixes: `+1M` (larger than 1MB), `-100k` (smaller than 100KB)
- Use `mtime` for time-based filtering: `-7` (modified in last 7 days), `+30` (older than 30 days)
- Set `maxdepth` to limit search depth for large directory trees
