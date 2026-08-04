-- Tiendanube OAuth config, catalog mapping, webhooks, and orders (#187)

CREATE TABLE "TiendanubeConfig" (
    "id" SERIAL NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "storeId" VARCHAR(40) NOT NULL,
    "storeName" VARCHAR(120),
    "storeUrl" VARCHAR(255),
    "accessTokenEncrypted" TEXT NOT NULL,
    "accessTokenLast4" VARCHAR(4) NOT NULL,
    "conectadoAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TiendanubeConfig_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "TiendanubeConfig_tenantId_key" ON "TiendanubeConfig"("tenantId");

CREATE INDEX "TiendanubeConfig_activo_idx" ON "TiendanubeConfig"("activo");

ALTER TABLE "TiendanubeConfig" ADD CONSTRAINT "TiendanubeConfig_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "TiendanubePublicacion" (
    "id" SERIAL NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "articuloId" INTEGER NOT NULL,
    "tnProductId" VARCHAR(40),
    "tnVariantId" VARCHAR(40),
    "estado" VARCHAR(20) NOT NULL DEFAULT 'pending',
    "permalink" VARCHAR(500),
    "syncStatus" VARCHAR(20) NOT NULL DEFAULT 'pending',
    "syncError" TEXT,
    "ultimaSyncAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TiendanubePublicacion_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "TiendanubePublicacion_articuloId_key" ON "TiendanubePublicacion"("articuloId");

CREATE UNIQUE INDEX "TiendanubePublicacion_tenantId_articuloId_key" ON "TiendanubePublicacion"("tenantId", "articuloId");

CREATE UNIQUE INDEX "TiendanubePublicacion_tenantId_tnProductId_key" ON "TiendanubePublicacion"("tenantId", "tnProductId");

CREATE INDEX "TiendanubePublicacion_tenantId_syncStatus_idx" ON "TiendanubePublicacion"("tenantId", "syncStatus");

CREATE INDEX "TiendanubePublicacion_articuloId_idx" ON "TiendanubePublicacion"("articuloId");

ALTER TABLE "TiendanubePublicacion" ADD CONSTRAINT "TiendanubePublicacion_articuloId_fkey" FOREIGN KEY ("articuloId") REFERENCES "Articulo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "TiendanubeWebhookEvent" (
    "id" SERIAL NOT NULL,
    "tenantId" INTEGER,
    "topic" VARCHAR(60) NOT NULL,
    "resource" VARCHAR(200) NOT NULL,
    "storeId" VARCHAR(40),
    "processedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TiendanubeWebhookEvent_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "TiendanubeWebhookEvent_topic_resource_key" ON "TiendanubeWebhookEvent"("topic", "resource");

CREATE INDEX "TiendanubeWebhookEvent_tenantId_processedAt_idx" ON "TiendanubeWebhookEvent"("tenantId", "processedAt");

ALTER TABLE "TiendanubeWebhookEvent" ADD CONSTRAINT "TiendanubeWebhookEvent_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "TiendanubeOrden" (
    "id" SERIAL NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "tnOrderId" VARCHAR(40) NOT NULL,
    "pedidoId" INTEGER,
    "status" VARCHAR(40) NOT NULL,
    "buyerNickname" VARCHAR(120),
    "cuitPending" BOOLEAN NOT NULL DEFAULT false,
    "stockAppliedAt" TIMESTAMP(3),
    "lastSyncedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TiendanubeOrden_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "TiendanubeOrden_pedidoId_key" ON "TiendanubeOrden"("pedidoId");

CREATE UNIQUE INDEX "TiendanubeOrden_tenantId_tnOrderId_key" ON "TiendanubeOrden"("tenantId", "tnOrderId");

CREATE INDEX "TiendanubeOrden_tenantId_status_idx" ON "TiendanubeOrden"("tenantId", "status");

ALTER TABLE "TiendanubeOrden" ADD CONSTRAINT "TiendanubeOrden_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "TiendanubeOrden" ADD CONSTRAINT "TiendanubeOrden_pedidoId_fkey" FOREIGN KEY ("pedidoId") REFERENCES "Pedido"("id") ON DELETE SET NULL ON UPDATE CASCADE;
