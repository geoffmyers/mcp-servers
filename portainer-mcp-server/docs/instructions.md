---
title: Portainer MCP Server
created: 2026-01-30
modified: 2026-01-30
description: This server provides tools for managing Docker environments via the Portainer CE/EE API.
tags: [mcp-servers]
---

# Portainer MCP Server

This server provides tools for managing Docker environments via the Portainer CE/EE API.

## Available Operations

### Environments
- List all managed Docker/Kubernetes environments

### Stacks
- List, create, update, delete, start, and stop Docker Compose stacks
- Retrieve stack compose file contents

### Containers
- List, inspect, start, stop, restart, and remove containers
- Retrieve container logs

### Images
- List, pull, remove, and prune Docker images

### Volumes
- List, create, and remove Docker volumes

### Networks
- List, create, and remove Docker networks

### Registries
- List, create, and update Docker registries

### Users & Teams
- List users and teams, update roles, create teams, manage team membership

### Templates
- List available application templates

## Safety

Destructive operations (delete, remove, prune) require explicit `confirm: true` parameter to prevent accidental execution.

## Authentication

Requires `PORTAINER_HOST` and either `PORTAINER_API_KEY` (preferred) or `PORTAINER_USERNAME` + `PORTAINER_PASSWORD`. Optionally set `PORTAINER_SECURE=false` for HTTP. Generate an API key in Portainer UI under Settings > Access tokens.
