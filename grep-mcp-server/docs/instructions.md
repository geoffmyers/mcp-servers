---
title: Grep MCP Server
created: 2026-01-31
modified: 2026-01-31
description: This server provides tools to search file contents using the grep command.
tags: [mcp-servers]
---

# Grep MCP Server

This server provides tools to search file contents using the `grep` command.

## Available Tools

- **grep_search** - Search for lines matching a pattern with line numbers and optional context
- **grep_count** - Count matching lines per file
- **grep_files_matching** - List files that contain at least one match

## Safety

All operations are read-only. No file modification is supported.

## Usage Tips

- Use `include` with glob patterns like `*.ts` to limit file types searched
- Use `exclude` to skip files like `*.min.js` or `node_modules`
- Enable `ignore_case` for case-insensitive searches
- Enable `word_regexp` to match whole words only (avoids partial matches)
- Enable `fixed_strings` when searching for literal text that contains regex special characters
- Use `context_lines` to see surrounding lines for each match
- Use `max_count` to limit matches per file when you only need a few examples
- Patterns use basic regex by default: `.` matches any char, `*` repeats, `[abc]` character classes
- Use `grep_files_matching` when you only need file paths, not the matching lines
- Use `grep_count` to understand how widespread a pattern is across a codebase
