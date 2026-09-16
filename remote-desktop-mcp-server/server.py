#!/usr/bin/env python3
"""Remote Desktop MCP server — view & control Windows, Linux, and macOS hosts over VNC.

A general-purpose computer-use tool for Claude Code: screenshot + mouse/keyboard drive of
any configured VNC host, alongside SSH. Supports:
  * Standard VNC password authentication (Windows/Linux/most servers)
  * Apple ARD authentication (macOS Screen Sharing): username + password (Diffie-Hellman)

Built on `asyncvnc` (async, handles both auth types). Multiple hosts live in a registry
(hosts.json / VNC_HOSTS env); tools take an optional `host` name and fall back to the default.

Why VNC (not RDP): VNC mirrors the live console session; RDP disconnects it (which on the
GamingPC would tear down Docker Desktop / the GPU node). VNC also works uniformly across
Windows, Linux, and macOS.

Config — a JSON registry, resolved from (first found): env VNC_HOSTS (inline JSON), else
hosts.json (generated from hosts.json.tpl via `op inject`, gitignored). Shape:
  {"default": "gamingpc",
   "hosts": {
     "gamingpc": {"host":"192.0.2.10","port":5900,"password":"...","platform":"windows"},
     "macmini":  {"host":"192.0.2.11","port":5900,"username":"<user>","password":"...","platform":"macos"}
   }}
A host with a `username` uses Apple ARD auth; otherwise standard VNC password auth.
"""
import asyncio
import io
import json
import os
from contextlib import AsyncExitStack
from typing import Optional

import asyncvnc
from PIL import Image as PILImage
from mcp.server.fastmcp import FastMCP, Image as MCPImage

MAX_DIM = int(os.environ.get("VNC_MAX_DIM", "1400"))
REFRESH_WAIT = float(os.environ.get("VNC_REFRESH_WAIT", "1.0"))

mcp = FastMCP("remote-desktop")


# ---------------------------------------------------------------- host registry
def _load_registry():
    raw = os.environ.get("VNC_HOSTS")
    if not raw:
        path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "hosts.json")
        if os.path.exists(path):
            with open(path) as f:
                raw = f.read()
    if not raw:
        return {}, None
    data = json.loads(raw)
    hosts = data.get("hosts", data)
    default = data.get("default") or (next(iter(hosts)) if hosts else None)
    return hosts, default


REGISTRY, DEFAULT_HOST = _load_registry()


# --------------------------------------------------------------- key name maps
# Friendly name -> X keysym name used by asyncvnc/keysymdef.
_KEY_ALIASES = {
    "enter": "Return", "return": "Return", "esc": "Escape", "escape": "Escape",
    "tab": "Tab", "space": "space", "backspace": "BackSpace", "bksp": "BackSpace",
    "del": "Delete", "delete": "Delete", "ins": "Insert", "insert": "Insert",
    "home": "Home", "end": "End", "pageup": "Page_Up", "pgup": "Page_Up",
    "pagedown": "Page_Down", "pgdn": "Page_Down", "up": "Up", "down": "Down",
    "left": "Left", "right": "Right", "ctrl": "Control_L", "control": "Control_L",
    "alt": "Alt_L", "option": "Alt_L", "opt": "Alt_L", "shift": "Shift_L",
    "win": "Super_L", "super": "Super_L", "cmd": "Super_L", "meta": "Super_L",
    "capslock": "Caps_Lock", "printscreen": "Print", "menu": "Menu",
}


def _keysym(token: str) -> str:
    t = token.strip()
    low = t.lower()
    if low in _KEY_ALIASES:
        return _KEY_ALIASES[low]
    if len(t) in (2, 3) and t[0].lower() == "f" and t[1:].isdigit():
        return "F" + t[1:]
    return t  # single char or already-a-keysym


def _parse_chord(spec: str):
    # 'ctrl-c' -> ['Control_L','c']; 'alt-tab' -> ['Alt_L','Tab']; 'enter' -> ['Return']
    parts = spec.replace("+", "-").split("-")
    return [_keysym(p) for p in parts if p != ""]


# ------------------------------------------------------------- connection pool
class Conn:
    def __init__(self, client, stack):
        self.client = client
        self.stack = stack
        self.scale = 1.0
        self.native = (0, 0)


_conns: "dict[str, Conn]" = {}
_pool_lock = asyncio.Lock()


def _resolve(host):
    name = host or DEFAULT_HOST
    if name is None:
        raise ValueError("no host specified and no default configured")
    if name not in REGISTRY:
        raise ValueError(f"unknown host '{name}'. configured: {', '.join(REGISTRY) or '(none)'}")
    return name, REGISTRY[name]


async def _get(host):
    name, cfg = _resolve(host)
    async with _pool_lock:
        c = _conns.get(name)
        if c is not None:
            return name, c
        stack = AsyncExitStack()
        client = await stack.enter_async_context(asyncvnc.connect(
            cfg["host"], int(cfg.get("port", 5900)),
            username=cfg.get("username"), password=cfg.get("password")))
        c = Conn(client, stack)
        _conns[name] = c
        return name, c


async def _drop(name):
    c = _conns.pop(name, None)
    if c:
        try:
            await c.stack.aclose()
        except Exception:
            pass


async def _with_client(host, fn):
    """Run fn(conn) with a live connection; reconnect once on failure."""
    name, c = await _get(host)
    try:
        return await fn(c)
    except Exception:
        await _drop(name)
        name, c = await _get(host)
        return await fn(c)


def _to_native(c: Conn, x: int, y: int):
    return int(round(x * c.scale)), int(round(y * c.scale))


async def _capture(c: Conn):
    # prime (first read is often the black initial buffer), settle, then capture
    await c.client.screenshot()
    await asyncio.sleep(REFRESH_WAIT)
    px = await c.client.screenshot()
    im = PILImage.fromarray(px[:, :, :3], "RGB")
    c.native = im.size
    scale = max(im.width, im.height) / MAX_DIM
    if scale > 1.0:
        im = im.resize((int(im.width / scale), int(im.height / scale)), PILImage.LANCZOS)
        c.scale = scale
    else:
        c.scale = 1.0
    buf = io.BytesIO()
    im.save(buf, format="PNG")
    return buf.getvalue()


# --------------------------------------------------------------------- tools
@mcp.tool()
async def list_hosts() -> str:
    """List configured remote-desktop hosts and their auth type."""
    if not REGISTRY:
        return "no hosts configured (set VNC_HOSTS or hosts.json)"
    lines = [f"default: {DEFAULT_HOST}"]
    for n, cfg in REGISTRY.items():
        auth = ("ARD (user+pass)" if cfg.get("username")
                else "VNC password" if cfg.get("password") else "none")
        lines.append(f"  {n}: {cfg['host']}:{cfg.get('port', 5900)} "
                     f"[{cfg.get('platform', '?')}] auth={auth}")
    return "\n".join(lines)


@mcp.tool()
async def screenshot(host: Optional[str] = None) -> MCPImage:
    """Capture a host's desktop. Coordinates for click/move/etc. are in THIS image's
    pixel space (downscaled from native; the server scales them back automatically)."""
    png = await _with_client(host, _capture)
    return MCPImage(data=png, format="png")


@mcp.tool()
async def screen_info(host: Optional[str] = None) -> str:
    """Report a host's native resolution and current display scale."""
    async def fn(c):
        await _capture(c)
        return c
    c = await _with_client(host, fn)
    dw, dh = int(c.native[0] / c.scale), int(c.native[1] / c.scale)
    return f"native={c.native[0]}x{c.native[1]} displayed={dw}x{dh} scale={c.scale:.3f}"


@mcp.tool()
async def click(x: int, y: int, host: Optional[str] = None,
                button: str = "left", double: bool = False) -> str:
    """Click at (x, y) in the last screenshot's image space. button: left|middle|right."""
    idx = {"left": 0, "middle": 1, "right": 2}.get(button, 0)

    async def fn(c):
        nx, ny = _to_native(c, x, y)
        c.client.mouse.move(nx, ny)
        c.client.mouse.click(idx)
        if double:
            c.client.mouse.click(idx)
        await c.client.drain()
        return f"{'double-' if double else ''}{button} click at native ({nx},{ny})"
    return await _with_client(host, fn)


@mcp.tool()
async def move(x: int, y: int, host: Optional[str] = None) -> str:
    """Move the mouse to (x, y) in the last screenshot's image space."""
    async def fn(c):
        nx, ny = _to_native(c, x, y)
        c.client.mouse.move(nx, ny)
        await c.client.drain()
        return f"moved to native ({nx},{ny})"
    return await _with_client(host, fn)


@mcp.tool()
async def type_text(text: str, host: Optional[str] = None) -> str:
    """Type a string at the current focus."""
    async def fn(c):
        c.client.keyboard.write(text)
        await c.client.drain()
        return f"typed {len(text)} chars"
    return await _with_client(host, fn)


@mcp.tool()
async def key(keys: str, host: Optional[str] = None) -> str:
    """Press a key or chord. Examples: 'enter', 'tab', 'esc', 'ctrl-c', 'alt-tab',
    'alt-F4', 'cmd-space' (mac), 'ctrl-shift-esc', 'super'."""
    syms = _parse_chord(keys)

    async def fn(c):
        c.client.keyboard.press(*syms)
        await c.client.drain()
        return f"pressed {keys} -> {'+'.join(syms)}"
    return await _with_client(host, fn)


@mcp.tool()
async def scroll(x: int, y: int, host: Optional[str] = None,
                 clicks: int = 3, direction: str = "down") -> str:
    """Scroll at (x, y) in image space. direction: up|down."""
    async def fn(c):
        nx, ny = _to_native(c, x, y)
        c.client.mouse.move(nx, ny)
        if direction == "up":
            c.client.mouse.scroll_up(max(1, clicks))
        else:
            c.client.mouse.scroll_down(max(1, clicks))
        await c.client.drain()
        return f"scrolled {direction} {clicks} at native ({nx},{ny})"
    return await _with_client(host, fn)


@mcp.tool()
async def drag(x1: int, y1: int, x2: int, y2: int,
               host: Optional[str] = None, button: str = "left") -> str:
    """Drag from (x1,y1) to (x2,y2) in image space (press, move, release)."""
    idx = {"left": 0, "middle": 1, "right": 2}.get(button, 0)

    async def fn(c):
        ax, ay = _to_native(c, x1, y1)
        bx, by = _to_native(c, x2, y2)
        c.client.mouse.move(ax, ay)
        with c.client.mouse.hold(idx):
            c.client.mouse.move(bx, by)
        await c.client.drain()
        return f"dragged native ({ax},{ay})->({bx},{by})"
    return await _with_client(host, fn)


if __name__ == "__main__":
    mcp.run()
