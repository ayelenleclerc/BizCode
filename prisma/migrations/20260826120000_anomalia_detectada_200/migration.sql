-- Billing anomaly detection (#200 Fase 1)
CREATE TABLE "AnomaliaDetectada" (
    "id" SERIAL NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "tipo" VARCHAR(60) NOT NULL,
    "severidad" VARCHAR(20) NOT NULL,
    "facturaId" INTEGER,
    "clienteId" INTEGER,
    "descripcion" VARCHAR(500) NOT NULL,
    "detalle" JSONB,
    "confirmada" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AnomaliaDetectada_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "AnomaliaDetectada_tenantId_createdAt_idx" ON "AnomaliaDetectada"("tenantId", "createdAt");
CREATE INDEX "AnomaliaDetectada_tenantId_tipo_idx" ON "AnomaliaDetectada"("tenantId", "tipo");
CREATE INDEX "AnomaliaDetectada_tenantId_facturaId_idx" ON "AnomaliaDetectada"("tenantId", "facturaId");
CREATE INDEX "AnomaliaDetectada_tenantId_clienteId_idx" ON "AnomaliaDetectada"("tenantId", "clienteId");

ALTER TABLE "AnomaliaDetectada" ADD CONSTRAINT "AnomaliaDetectada_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "AnomaliaDetectada" ADD CONSTRAINT "AnomaliaDetectada_facturaId_fkey" FOREIGN KEY ("facturaId") REFERENCES "Factura"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "AnomaliaDetectada" ADD CONSTRAINT "AnomaliaDetectada_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE SET NULL ON UPDATE CASCADE;
