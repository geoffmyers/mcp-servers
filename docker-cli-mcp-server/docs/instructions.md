# Docker CLI MCP Server

This server provides tools for managing Docker containers, images, volumes, networks, and Compose stacks via the Docker CLI.

## Available Operations

### Containers
- List, inspect, start, stop, restart, remove containers
- View container logs

### Images
- List, pull, remove, prune images

### Volumes
- List, create, remove volumes

### Networks
- List, inspect networks

### Compose
- Deploy (up), tear down (down), view status, view logs, pull images for Compose stacks

### System
- View Docker system info
- Prune unused resources

## Safety

Destructive operations (remove, prune, compose down) require explicit `confirm: true` parameter.

## Execution

Commands run either locally or via SSH depending on configuration.
