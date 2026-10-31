#!/usr/bin/env python3
"""Shell front end to the remote-desktop MCP tools, for sessions where the MCP server is not loaded.

  .venv/bin/python cli.py HOST STEP [STEP ...]

Runs every step over ONE VNC connection, in order. It always captures once first, so click/move
coordinates are in the same downscaled image space as `shot:` output (the MCP screenshot's space).
Steps:
  shot:PATH            save a screenshot (PNG)
  click:X,Y            left click        click:X,Y,right   click:X,Y,double
  move:X,Y             move the pointer
  type:TEXT            type TEXT at the current focus (the rest of the argument, colons included)
  key:CHORD            press a key or chord, e.g. key:enter  key:win-r  key:ctrl-shift-enter
  sleep:SECONDS        wait
Hosts and passwords come from hosts.json, exactly as for server.py.
"""
import asyncio
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import server  # noqa: E402  (registry, connection pool and key parsing live there)


async def main(host, steps):
    _, c = await server._get(host)
    await server._capture(c)  # establishes c.scale for coordinate conversion
    for step in steps:
        op, _, arg = step.partition(":")
        if op == "shot":
            with open(arg, "wb") as f:
                f.write(await server._capture(c))
            print(f"saved {arg} (native {c.native[0]}x{c.native[1]}, scale {c.scale:.3f})")
        elif op in ("click", "move"):
            parts = arg.split(",")
            nx, ny = server._to_native(c, int(parts[0]), int(parts[1]))
            c.client.mouse.move(nx, ny)
            if op == "click":
                btn = {"right": 2, "middle": 1}.get(parts[2] if len(parts) > 2 else "", 0)
                c.client.mouse.click(btn)
                if len(parts) > 2 and parts[2] == "double":
                    c.client.mouse.click(btn)
            await c.client.drain()
            print(f"{op} native ({nx},{ny})")
        elif op == "type":
            c.client.keyboard.write(arg)
            await c.client.drain()
            print(f"typed {len(arg)} chars")
        elif op == "key":
            c.client.keyboard.press(*server._parse_chord(arg))
            await c.client.drain()
            print(f"pressed {arg}")
        elif op == "sleep":
            await asyncio.sleep(float(arg))
        else:
            sys.exit(f"unknown step {step!r}")
    await server._drop(host)


if __name__ == "__main__":
    if len(sys.argv) < 3:
        sys.exit(__doc__)
    asyncio.run(main(sys.argv[1], sys.argv[2:]))
