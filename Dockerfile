# One MCP server as a container, built from this npm workspace:
#
#   docker build --build-arg SERVER=find-mcp-server \
#     --build-arg PACKAGES="findutils openssh-client" -t mcp-find .
#
# PACKAGES are Alpine packages the server runs: the command it wraps (the base
# image has only BusyBox versions, and no rsync or nmap) and ssh for
# EXECUTION_MODE=ssh.
# The servers share mcp-server-shared and one package-lock.json, so a build
# needs the workspace root as its context: a server's own directory has no
# lockfile, and `npm ci` refuses to run without one. The image serves MCP over
# Streamable HTTP; each server's README gives its port.
ARG NODE_IMAGE=node:22-alpine

# The build runs on the build machine's own platform: its output (compiled
# JavaScript, and dependencies installed without scripts) is the same for
# every platform, and npm under arm64 emulation can hang for an hour.
FROM --platform=$BUILDPLATFORM ${NODE_IMAGE} AS builder
ARG SERVER
WORKDIR /app
COPY . .
RUN test -n "$SERVER" && test -f "$SERVER/package.json" \
    || { echo "set --build-arg SERVER=<a *-mcp-server directory>"; exit 1; }
RUN npm ci --ignore-scripts
RUN npm run build --workspace mcp-server-shared --workspace "$SERVER"
RUN npm prune --omit=dev
# The runtime user must read the files that came from the build context,
# whatever the build host's permissions were (npm's own files already are).
RUN chmod -R a+rX package.json mcp-server-shared "$SERVER"

FROM ${NODE_IMAGE}
ARG SERVER
ARG PACKAGES=""
RUN if [ -n "$PACKAGES" ]; then apk add --no-cache $PACKAGES; fi
ENV NODE_ENV=production
WORKDIR /app
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/mcp-server-shared/package.json ./mcp-server-shared/
COPY --from=builder /app/mcp-server-shared/dist ./mcp-server-shared/dist
COPY --from=builder /app/${SERVER}/package.json ./${SERVER}/
COPY --from=builder /app/${SERVER}/dist ./${SERVER}/dist
WORKDIR /app/${SERVER}
USER node
CMD ["node", "dist/index.js", "streamableHttp"]
