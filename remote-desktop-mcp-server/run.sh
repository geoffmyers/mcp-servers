#!/usr/bin/env bash
# Launch the Remote Desktop MCP server (stdio). Host registry comes from hosts.json,
# generated from the op-templated hosts.json.tpl (gitignored). Or set VNC_HOSTS (inline JSON).
cd "$(dirname "$(readlink -f "$0")")" || exit 1
if [ ! -f hosts.json ] && [ -f hosts.json.tpl ]; then
  op inject -i hosts.json.tpl -o hosts.json 2>/dev/null && chmod 600 hosts.json 2>/dev/null
fi
exec .venv/bin/python server.py
