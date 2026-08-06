-- Multi-organism fiscal e-invoicing module (#378, ADR-0018).
-- Adds FiscalProviderConfig (per-tenant provider settings) and FiscalDocument
-- (authorization attempts/results for invoices and credit notes) without
-- removing the legacy `TenantFiscalConfig` table, which stays dual-read/write
-- during the transition (see docs/en/adr/ADR-0018-fiscal-multi-organism-module.md).
--
-- NOTE: the data backfill from `TenantFiscalConfig` into `FiscalProviderConfig`
-- (providerCode='arca_wsfe') is NOT expressed as SQL here because
-- `encryptedConfig` re-encrypts a plaintext JSON bundle {cuit, certificate,
-- privateKey, ambiente} using the app's AES-256-GCM helper
-- (apps/server/fiscal/ar/fiscalSecrets.ts), which requires Node crypto to
-- decrypt the existing `certEncrypted`/`keyEncrypted` values first. Run
-- `npm run fiscal:migrate-provider-config` (scripts/migrate-fiscal-provider-config-378.ts)
-- after applying this migration, then `npm run fiscal:verify-provider-migration`
-- to verify parity.

-- CreateTable
CREATE TABLE "FiscalProviderConfig" (
    "id" SERIAL NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "providerCode" VARCHAR(30) NOT NULL,
    "countryCode" VARCHAR(2) NOT NULL,
    "environment" VARCHAR(20) NOT NULL DEFAULT 'homologacion',
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "taxIdentifier" VARCHAR(20),
    "legalName" VARCHAR(160),
    "pointOfSale" VARCHAR(10),
    "encryptedConfig" TEXT NOT NULL,
    "configVersion" INTEGER NOT NULL DEFAULT 1,
    "lastValidationAt" TIMESTAMP(3),
    "validationStatus" VARCHAR(20),
    "validationError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FiscalProviderConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FiscalDocument" (
    "id" SERIAL NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "invoiceId" INTEGER,
    "notaCreditoId" INTEGER,
    "providerCode" VARCHAR(30) NOT NULL,
    "providerConfigId" INTEGER,
    "countryCode" VARCHAR(2) NOT NULL,
    "environment" VARCHAR(20) NOT NULL,
    "documentType" VARCHAR(20) NOT NULL,
    "documentNumber" VARCHAR(30),
    "pointOfSale" VARCHAR(10),
    "status" VARCHAR(20) NOT NULL DEFAULT 'pending',
    "externalReference" VARCHAR(80),
    "authorizationCode" VARCHAR(30),
    "authorizationExpiresAt" TIMESTAMP(3),
    "requestPayload" JSONB,
    "responsePayload" JSONB,
    "providerMetadata" JSONB,
    "idempotencyKey" VARCHAR(120) NOT NULL,
    "attemptCount" INTEGER NOT NULL DEFAULT 0,
    "lastAttemptAt" TIMESTAMP(3),
    "nextRetryAt" TIMESTAMP(3),
    "errorCode" VARCHAR(40),
    "errorMessage" TEXT,
    "errorCategory" VARCHAR(30),
    "authorizedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FiscalDocument_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FiscalProviderConfig_tenantId_providerCode_key" ON "FiscalProviderConfig"("tenantId", "providerCode");

-- CreateIndex
CREATE INDEX "FiscalDocument_tenantId_invoiceId_idx" ON "FiscalDocument"("tenantId", "invoiceId");

-- CreateIndex
CREATE INDEX "FiscalDocument_status_nextRetryAt_idx" ON "FiscalDocument"("status", "nextRetryAt");

-- CreateIndex
CREATE UNIQUE INDEX "FiscalDocument_tenantId_idempotencyKey_key" ON "FiscalDocument"("tenantId", "idempotencyKey");

-- AddForeignKey
ALTER TABLE "FiscalProviderConfig" ADD CONSTRAINT "FiscalProviderConfig_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FiscalDocument" ADD CONSTRAINT "FiscalDocument_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FiscalDocument" ADD CONSTRAINT "FiscalDocument_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Factura"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FiscalDocument" ADD CONSTRAINT "FiscalDocument_notaCreditoId_fkey" FOREIGN KEY ("notaCreditoId") REFERENCES "NotaCredito"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FiscalDocument" ADD CONSTRAINT "FiscalDocument_providerConfigId_fkey" FOREIGN KEY ("providerConfigId") REFERENCES "FiscalProviderConfig"("id") ON DELETE SET NULL ON UPDATE CASCADE;
