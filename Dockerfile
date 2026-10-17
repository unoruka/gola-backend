# Gola standalone backend — Docker image for Render (free tier) or any host.
# Uses the official Bun image; no paid services required.
# Pinned to 1.4.2: Bun 1.4.3's parser rejects the bundled actions.js
# (variable shadowing false positive); 1.4.2 runs it correctly.
FROM oven/bun:1.4.2 AS runtime

WORKDIR /app

# Install dependencies first (better layer caching)
COPY package.json bun.lock ./
RUN bun install --production --frozen-lockfile

# Copy server source, compiled actions, and migrations.
# (dist/actions.js is split into parts because GitHub's file API is text-only
# with per-call size limits; reassemble it here in explicit order.)
COPY src/ ./src/
COPY dist/ ./dist/
COPY drizzle/ ./drizzle/
RUN cat dist/actions.js.part-1 dist/actions.js.part-2 dist/actions.js.part-3 > dist/actions.js && rm dist/actions.js.part-* && wc -c dist/actions.js && bun --version

# Data lives here (SQLite app.db + uploaded blobs).
# On Render's free tier the filesystem is ephemeral: data resets on restart.
# For permanent data, use a host with a persistent disk and set GOLA_DATA_DIR.
ENV GOLA_DATA_DIR=/app/data
# L3: the runtime user is `bun` (see USER below), so hand /app to it now —
# a bare `USER bun` would leave /app/data root-owned and crash the boot when
# SQLite opens app.db for writing.
RUN mkdir -p /app/data && chown -R bun:bun /app

# Render injects PORT; default 8787 for local runs.
ENV PORT=8787
EXPOSE 8787

# L3: defense in depth — never run the server as root. The oven/bun:1.4.2
# base image ships a `bun` user (uid 1000, verified in the image's own
# Dockerfile at tag bun-v1.4.2); /app was chown'ed to it above, and the
# entrypoint just execs the CMD, so `bun src/server.ts` runs unprivileged
# with write access to GOLA_DATA_DIR and read access to its code.
# Render honors the image USER, so this is deterministic on any host.
USER bun

CMD ["bun", "src/server.ts"]
