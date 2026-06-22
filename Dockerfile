FROM node:22-alpine AS deps
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@10.30.2 --activate

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
COPY apps/server/package.json apps/server/
COPY apps/web/package.json apps/web/
COPY packages/types/package.json packages/types/
COPY packages/api-client/package.json packages/api-client/
RUN pnpm install --frozen-lockfile --prod=false

FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

RUN corepack enable && corepack prepare pnpm@10.30.2 --activate

COPY --from=deps /app/node_modules ./node_modules
COPY . .

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=5 \
  CMD wget -qO- http://127.0.0.1:3001/api/health >/dev/null || exit 1

CMD ["pnpm", "run", "server"]
