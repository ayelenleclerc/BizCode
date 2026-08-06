-- Multi-provider payment config (#377). Legacy MercadoPagoConfig retained for dual-read/write.
CREATE TABLE "PaymentProviderConfig" (
    "id" SERIAL NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "providerCode" VARCHAR(30) NOT NULL,
    "environment" VARCHAR(20) NOT NULL DEFAULT 'sandbox',
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "encryptedConfig" TEXT NOT NULL,
    "accessTokenLast4" VARCHAR(4),
    "publicKey" VARCHAR(120),
    "webhookSecretSet" BOOLEAN NOT NULL DEFAULT false,
    "configVersion" INTEGER NOT NULL DEFAULT 1,
    "lastValidationAt" TIMESTAMP(3),
    "validationStatus" VARCHAR(20),
    "validationError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaymentProviderConfig_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "PaymentProviderConfig_tenantId_providerCode_key" ON "PaymentProviderConfig"("tenantId", "providerCode");
CREATE INDEX "PaymentProviderConfig_tenantId_idx" ON "PaymentProviderConfig"("tenantId");
CREATE INDEX "PaymentProviderConfig_providerCode_idx" ON "PaymentProviderConfig"("providerCode");

ALTER TABLE "PaymentProviderConfig" ADD CONSTRAINT "PaymentProviderConfig_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
