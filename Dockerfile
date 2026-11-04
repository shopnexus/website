# Astro SSR on the Node standalone adapter. Bun installs and builds; Node runs
# dist/server/entry.mjs with production dependencies only.
FROM oven/bun:1-alpine AS deps
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

FROM oven/bun:1-alpine AS prod-deps
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile --production

FROM node:24-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN node node_modules/astro/bin/astro.mjs build

FROM node:24-alpine AS runtime
WORKDIR /app
# API_URL is read at runtime (astro.config.mjs). The in-cluster Service name
# resolves in whichever stack namespace the website runs in.
ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=3000 \
    API_URL=http://server-api:8080/v1
COPY --from=prod-deps --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/dist ./dist
COPY --chown=node:node package.json ./
USER node
EXPOSE 3000
CMD ["node", "dist/server/entry.mjs"]
