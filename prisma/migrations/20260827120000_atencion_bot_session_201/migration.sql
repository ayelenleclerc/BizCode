-- CreateTable
CREATE TABLE "AtencionBotSession" (
    "id" SERIAL NOT NULL,
    "phoneDigits" VARCHAR(20) NOT NULL,
    "tenantId" INTEGER,
    "clienteId" INTEGER,
    "locale" VARCHAR(10) NOT NULL DEFAULT 'es',
    "pendingStep" VARCHAR(40),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AtencionBotSession_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AtencionBotSession_phoneDigits_key" ON "AtencionBotSession"("phoneDigits");

-- CreateIndex
CREATE INDEX "AtencionBotSession_updatedAt_idx" ON "AtencionBotSession"("updatedAt");

-- CreateIndex
CREATE INDEX "AtencionBotSession_tenantId_idx" ON "AtencionBotSession"("tenantId");

-- CreateIndex
CREATE INDEX "AtencionBotSession_clienteId_idx" ON "AtencionBotSession"("clienteId");

-- AddForeignKey
ALTER TABLE "AtencionBotSession" ADD CONSTRAINT "AtencionBotSession_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AtencionBotSession" ADD CONSTRAINT "AtencionBotSession_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE SET NULL ON UPDATE CASCADE;
