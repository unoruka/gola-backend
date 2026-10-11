# Gola standalone backend — Docker image for Render (free tier) or any host.
# Uses the official Bun image; no paid services required.
FROM oven/bun:1.4 AS runtime

WORKDIR /app

# Install dependencies first (better layer caching)
COPY package.json bun.lock ./
RUN bun install --production --frozen-lockfile

# Copy server source, compiled actions, and migrations.
# (dist/actions.js is split into parts because GitHub's file API is text-only
# with per-call size limits; reassemble it here.)
COPY src/ ./src/
COPY dist/ ./dist/
COPY drizzle/ ./drizzle/
RUN cat dist/actions.js.part-* > dist/actions.js && rm dist/actions.js.part-*

# Data lives here (SQLite app.db + uploaded blobs).
# On Render's free tier the filesystem is ephemeral: data resets on restart.
# For permanent data, use a host with a persistent disk and set GOLA_DATA_DIR.
ENV GOLA_DATA_DIR=/app/data
RUN mkdir -p /app/data

# Render injects PORT; default 8787 for local runs.
ENV PORT=8787
EXPOSE 8787

CMD ["bun", "src/server.ts"]
