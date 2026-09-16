# Sed MCP Server

This server provides tools to perform text transformations using the `sed` command.

## Available Tools

- **sed_preview** - Preview a substitution without modifying the file (dry run)
- **sed_replace** - Perform an in-place substitution with automatic backup
- **sed_extract** - Extract specific lines or pattern matches from a file

## Safety

- `sed_preview` is read-only and never modifies files
- `sed_replace` requires explicit `confirm: true` and always creates a backup file
- `sed_extract` is read-only, using `sed -n` to print selected lines

## Usage Tips

- Always use `sed_preview` first to verify your pattern before applying changes
- Patterns follow standard sed syntax: `s/search/replace/`
- Use `global: true` to replace all occurrences on each line, not just the first
- Use `extended_regex: true` for extended regex (groups, alternation, quantifiers)
- Use `case_insensitive: true` for case-insensitive matching
- For `sed_extract`, use expressions like `5,10p` (lines 5-10) or `/pattern/p` (matching lines)
- The `backup_suffix` defaults to `.bak` - the original file is saved as `filename.bak`
