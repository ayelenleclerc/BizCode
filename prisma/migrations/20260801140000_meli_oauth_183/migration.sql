-- MercadoLibre OAuth config per tenant (#183)
CREATE TABLE "MeliConfig" (
    "id" SERIAL NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "meliUserId" VARCHAR(40) NOT NULL,
    "sellerId" VARCHAR(40) NOT NULL,
    "sitio" VARCHAR(10) NOT NULL,
    "nickname" VARCHAR(120),
    "accessTokenEncrypted" TEXT NOT NULL,
    "refreshTokenEncrypted" TEXT NOT NULL,
    "accessTokenLast4" VARCHAR(4) NOT NULL,
    "tokenExpiresAt" TIMESTAMP(3) NOT NULL,
    "conectadoAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MeliConfig_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "MeliConfig_tenantId_key" ON "MeliConfig"("tenantId");

CREATE INDEX "MeliConfig_tokenExpiresAt_idx" ON "MeliConfig"("tokenExpiresAt");

CREATE INDEX "MeliConfig_activo_idx" ON "MeliConfig"("activo");

ALTER TABLE "MeliConfig" ADD CONSTRAINT "MeliConfig_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
