-- CreateTable PadronA4Cache (#192)
CREATE TABLE "PadronA4Cache" (
    "id" SERIAL NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "cuit" VARCHAR(11) NOT NULL,
    "payload" JSONB NOT NULL,
    "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PadronA4Cache_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PadronA4Cache_tenantId_expiresAt_idx" ON "PadronA4Cache"("tenantId", "expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "PadronA4Cache_tenantId_cuit_key" ON "PadronA4Cache"("tenantId", "cuit");

-- AddForeignKey
ALTER TABLE "PadronA4Cache" ADD CONSTRAINT "PadronA4Cache_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
