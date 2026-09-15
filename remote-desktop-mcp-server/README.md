---
title: Remote Desktop MCP Server
description: "General-purpose remote desktop control for Claude Code — view & drive Windows, Linux, and macOS hosts over VNC (screenshot + mouse/keyboard), a computer-use loop alongside SSH. Supports standard VNC password auth AND Apple ARD (username+password) auth."
created: 2026-07-10
modified: 2026-07-10
tags: [mcp-servers, vnc, remote-desktop, windows, linux, macos, computer-use, ard]
---

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

VNC **mirrors the live console session**. RDP **disconnects** it and makes a new one — which on
the GamingPC tears down **Docker Desktop / the GPU node** (immich-ml + ollama-3070) that depend on
the console session. VNC also works uniformly across Windows, Linux, and macOS.

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

A JSON registry, resolved from env `VNC_HOSTS` (inline JSON) or `hosts.json` (generated from
`hosts.json.tpl` via `op inject`, gitignored). See `hosts.json.example` for Windows / macOS / Linux
entries. Shape:

```json
{
  "default": "gamingpc",
  "hosts": {
    "gamingpc": {"host": "192.0.2.10", "port": 5900, "password": "op://<vault>/gamingpc-vnc/password", "platform": "windows"},
    "macmini":  {"host": "192.0.2.11", "port": 5900, "username": "<user>", "password": "op://<vault>/macmini-screensharing/password", "platform": "macos"}
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
cd mcp-servers/remote-desktop-mcp-server
uv venv .venv --python 3.12 && uv pip install --python .venv/bin/python -r requirements.txt
cp hosts.json.example hosts.json    # or: op inject -i hosts.json.tpl -o hosts.json
./run.sh                             # stdio MCP server
```

Registered in the repo `.mcp.json` as **`remote-desktop`**
(`command: mcp-servers/remote-desktop-mcp-server/run.sh`). Restart Claude Code (or reconnect MCP)
to pick up a newly-added server. Not part of the npm workspace (Python); ignore it in `npm`
build/clean.
