# Xargs MCP Server

This server provides tools to execute commands with arguments built from input items using the `xargs` command.

## Available Tools

- **xargs_execute** - Execute a command against a list of input items using xargs

## Safety

Only a predefined allowlist of commands can be executed: `echo`, `ls`, `wc`, `file`, `stat`, `md5sum`, `sha256sum`, `basename`, `dirname`, `cat`, `head`, `tail`.

A `confirm` parameter must be set to `true` before any command runs.

## Usage Tips

- Use `max_procs` to run commands in parallel (default is 1 for sequential execution)
- Use `max_args` to control how many items are passed per command invocation
- Items are passed to xargs via stdin, one per line
- Example: `command: "echo"`, `items: ["hello", "world"]` runs `echo hello world`
- Example with `max_args: 1`: runs `echo hello` then `echo world` separately
