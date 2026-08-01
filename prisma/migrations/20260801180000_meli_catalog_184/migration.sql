-- Mercado Libre catalog listing mapping per article (#184)
CREATE TABLE "MeliPublicacion" (
    "id" SERIAL NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "articuloId" INTEGER NOT NULL,
    "meliItemId" VARCHAR(40),
    "meliCategoryId" VARCHAR(40) NOT NULL,
    "estado" VARCHAR(20) NOT NULL DEFAULT 'pending',
    "atributosJson" JSONB,
    "permalink" VARCHAR(500),
    "syncStatus" VARCHAR(20) NOT NULL DEFAULT 'pending',
    "syncError" TEXT,
    "ultimaSyncAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MeliPublicacion_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "MeliPublicacion_tenantId_articuloId_key" ON "MeliPublicacion"("tenantId", "articuloId");

CREATE UNIQUE INDEX "MeliPublicacion_articuloId_key" ON "MeliPublicacion"("articuloId");

CREATE UNIQUE INDEX "MeliPublicacion_tenantId_meliItemId_key" ON "MeliPublicacion"("tenantId", "meliItemId");

CREATE INDEX "MeliPublicacion_tenantId_syncStatus_idx" ON "MeliPublicacion"("tenantId", "syncStatus");

CREATE INDEX "MeliPublicacion_articuloId_idx" ON "MeliPublicacion"("articuloId");

ALTER TABLE "MeliPublicacion" ADD CONSTRAINT "MeliPublicacion_articuloId_fkey" FOREIGN KEY ("articuloId") REFERENCES "Articulo"("id") ON DELETE CASCADE ON UPDATE CASCADE;
