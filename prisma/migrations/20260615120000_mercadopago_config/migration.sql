-- CreateTable
CREATE TABLE "MercadoPagoConfig" (
    "id" SERIAL NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "accessTokenEncrypted" TEXT NOT NULL,
    "accessTokenLast4" VARCHAR(4) NOT NULL,
    "publicKey" VARCHAR(120) NOT NULL,
    "webhookSecretEncrypted" TEXT,
    "sandboxMode" BOOLEAN NOT NULL DEFAULT true,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MercadoPagoConfig_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MercadoPagoConfig_tenantId_key" ON "MercadoPagoConfig"("tenantId");

-- AddForeignKey
ALTER TABLE "MercadoPagoConfig" ADD CONSTRAINT "MercadoPagoConfig_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
