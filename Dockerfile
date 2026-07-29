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
ENV PATH="/app/node_modules/.bin:${PATH}"

# @en Drop Node-bundled npm (vulnerable node-tar). Do not install Corepack/pnpm in
#     runtime — its cache also ships vulnerable tar; invoke tsx via node_modules/.bin.
# @es Quitar npm embebido (node-tar vulnerable). No instalar Corepack/pnpm en runtime
#     (su caché trae tar vulnerable); ejecutar tsx vía node_modules/.bin.
# @pt-BR Remover npm embutido (node-tar vulnerável). Não instalar Corepack/pnpm no
#     runtime (o cache traz tar vulnerável); executar tsx via node_modules/.bin.
RUN rm -rf /usr/local/lib/node_modules/npm /usr/local/lib/node_modules/corepack \
  && rm -f /usr/local/bin/npm /usr/local/bin/npx /usr/local/bin/corepack \
  && rm -rf /root/.cache/node

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# @en semantic-release pulls npm@10 into the workspace; strip it from the runtime image.
# @es semantic-release trae npm@10 al workspace; eliminarlo de la imagen de runtime.
# @pt-BR semantic-release traz npm@10 ao workspace; removê-lo da imagem de runtime.
RUN rm -rf node_modules/npm \
  && find node_modules/.pnpm -maxdepth 1 -type d -name 'npm@*' -exec rm -rf {} +

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=5 \
  CMD wget -qO- http://127.0.0.1:3001/api/health >/dev/null || exit 1

CMD ["tsx", "apps/server/main.ts"]
