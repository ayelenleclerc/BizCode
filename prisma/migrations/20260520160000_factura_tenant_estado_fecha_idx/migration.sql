-- CreateIndex
CREATE INDEX "Factura_tenantId_estado_fecha_idx" ON "Factura"("tenantId", "estado", "fecha");
