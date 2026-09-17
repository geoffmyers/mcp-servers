# Remote Desktop MCP Server

Lets Claude Code **see** a remote desktop and **drive it** (click / type / keys / scroll / drag)
over VNC — a computer-use loop — in addition to SSH. **General purpose:** any number of
**Windows, Linux, and macOS** hosts, selected by name.

This is the repo's one **Python** MCP server (the others are TypeScript). Cross-platform VNC
framebuffer decoding + Apple ARD auth are exactly what the async `asyncvnc` library provides, so
Python earns its keep here.

## Authentication — both kinds

| Auth | When | Config |
|---|---|---|
| **Standard VNC password** | Windows (TightVNC/UltraVNC), Linux (x11vnc/TigerVNC/wayvnc) | `password` only |
| **Apple ARD** (Diffie-Hellman **username + password**) | macOS Screen Sharing / Remote Management | `username` + `password` |

A host entry with a `username` field uses Apple ARD auth; otherwise standard VNC password auth.

## Why VNC, not RDP

VNC **mirrors the live console session**. RDP **disconnects** it and makes a new one — which on a
Windows host tears down anything pinned to the console session (a GPU-backed Docker workload, for
example). VNC also works uniformly across Windows, Linux, and macOS.

## Tools

| Tool | Purpose |
|---|---|
| `list_hosts()` | Configured hosts + auth type |
| `screenshot(host?)` | Capture the desktop (downscaled; coords below are in this image's space) |
| `screen_info(host?)` | Native resolution + display scale |
| `click(x, y, host?, button, double)` | Click (left/middle/right, optional double) |
| `move(x, y, host?)` | Move mouse |
| `type_text(text, host?)` | Type a string |
| `key(keys, host?)` | Key/chord — `enter`, `tab`, `esc`, `ctrl-c`, `alt-tab`, `alt-F4`, `cmd-space`, … |
| `scroll(x, y, host?, clicks, direction)` | Mouse-wheel scroll |
| `drag(x1, y1, x2, y2, host?, button)` | Click-drag |

`host` defaults to the registry's `default`. **Coordinates** are in the **last screenshot's pixel
space** (downscaled from native, `VNC_MAX_DIM=1400`); the server tracks the per-host scale and
translates to native automatically — click where you see it.

## Host registry

A JSON registry, read from the env var `VNC_HOSTS` (inline JSON) or from `hosts.json`
(gitignored). Start from `hosts.json.example`, which has Windows / macOS / Linux entries. The
server does **not** resolve `op://…` values: they are 1Password references for
`op inject -i <template> -o hosts.json`, so either inject them that way or replace them with the
real values. Shape:

```json
{
  "default": "windows-desktop",
  "hosts": {
    "windows-desktop": {"host": "192.0.2.10", "port": 5900, "password": "op://<vault>/windows-desktop-vnc/password", "platform": "windows"},
    "mac-mini":  {"host": "192.0.2.11", "port": 5900, "username": "<user>", "password": "op://<vault>/mac-mini-screensharing/password", "platform": "macos"}
  }
}
```

## Two gotchas (handled here)

1. **Black first frame.** VNC captures the framebuffer before the server sends a full update →
   an all-black image. The server primes with a first read, waits `VNC_REFRESH_WAIT` (1.0s), then
   captures. If you get black frames, raise `VNC_REFRESH_WAIT`. (A normal VNC client showing the
   desktop fine is the tell it's capture timing, not a display problem.)
2. **Session routing (Windows).** VNC mirrors the **console** session. If the target session gets
   disconnected (an RDP/Parsec connect, or the display sleeping), the console becomes an empty
   session and VNC shows black / the logon screen. Reconnect over SSH: `tscon <id> /dest:console`,
   and disable display sleep (`powercfg /change monitor-timeout-ac 0`).

## Setup / run

```bash
cd remote-desktop-mcp-server
uv venv .venv --python 3.12 && uv pip install --python .venv/bin/python -r requirements.txt
cp hosts.json.example hosts.json    # then fill in your hosts and passwords
./run.sh                             # stdio MCP server
```

Register `run.sh` with your MCP client as a stdio server, for example in a
Claude Code `.mcp.json`:

```json
{
  "mcpServers": {
    "remote-desktop": { "command": "/absolute/path/to/remote-desktop-mcp-server/run.sh" }
  }
}
```

Restart Claude Code (or reconnect MCP) to pick up a newly added server. This
server is Python, so it is not part of the npm workspace; `npm` build and clean
ignore it.
