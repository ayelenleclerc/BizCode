-- CreateTable
CREATE TABLE "FiscalRetencionesConfig" (
    "id" SERIAL NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "esAgenteRetencionGanancias" BOOLEAN NOT NULL DEFAULT false,
    "esAgenteRetencionIVA" BOOLEAN NOT NULL DEFAULT false,
    "esAgenteRetencionIIBB" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FiscalRetencionesConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RegimenRetencion" (
    "id" SERIAL NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "tipo" VARCHAR(20) NOT NULL,
    "subtipo" VARCHAR(20) NOT NULL,
    "nombre" VARCHAR(80) NOT NULL,
    "alicuota" DECIMAL(8,4) NOT NULL,
    "alicuotaMin" DECIMAL(14,2),
    "provincia" VARCHAR(10),
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RegimenRetencion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RetencionAplicada" (
    "id" SERIAL NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "regimenId" INTEGER NOT NULL,
    "tipo" VARCHAR(20) NOT NULL,
    "entidadTipo" VARCHAR(20) NOT NULL,
    "entidadId" INTEGER NOT NULL,
    "facturaId" INTEGER,
    "cobroId" INTEGER,
    "reciboPagoId" INTEGER,
    "baseImponible" DECIMAL(14,2) NOT NULL,
    "alicuota" DECIMAL(8,4) NOT NULL,
    "importe" DECIMAL(14,2) NOT NULL,
    "constanciaNum" VARCHAR(30),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RetencionAplicada_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FiscalRetencionesConfig_tenantId_key" ON "FiscalRetencionesConfig"("tenantId");

-- CreateIndex
CREATE INDEX "RegimenRetencion_tenantId_activo_idx" ON "RegimenRetencion"("tenantId", "activo");

-- CreateIndex
CREATE INDEX "RegimenRetencion_tenantId_tipo_subtipo_idx" ON "RegimenRetencion"("tenantId", "tipo", "subtipo");

-- CreateIndex
CREATE INDEX "RetencionAplicada_tenantId_createdAt_idx" ON "RetencionAplicada"("tenantId", "createdAt");

-- CreateIndex
CREATE INDEX "RetencionAplicada_tenantId_entidadTipo_entidadId_idx" ON "RetencionAplicada"("tenantId", "entidadTipo", "entidadId");

-- CreateIndex
CREATE INDEX "RetencionAplicada_tenantId_tipo_idx" ON "RetencionAplicada"("tenantId", "tipo");

-- AddForeignKey
ALTER TABLE "FiscalRetencionesConfig" ADD CONSTRAINT "FiscalRetencionesConfig_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegimenRetencion" ADD CONSTRAINT "RegimenRetencion_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RetencionAplicada" ADD CONSTRAINT "RetencionAplicada_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RetencionAplicada" ADD CONSTRAINT "RetencionAplicada_regimenId_fkey" FOREIGN KEY ("regimenId") REFERENCES "RegimenRetencion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RetencionAplicada" ADD CONSTRAINT "RetencionAplicada_facturaId_fkey" FOREIGN KEY ("facturaId") REFERENCES "Factura"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RetencionAplicada" ADD CONSTRAINT "RetencionAplicada_cobroId_fkey" FOREIGN KEY ("cobroId") REFERENCES "Cobro"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RetencionAplicada" ADD CONSTRAINT "RetencionAplicada_reciboPagoId_fkey" FOREIGN KEY ("reciboPagoId") REFERENCES "ReciboPago"("id") ON DELETE SET NULL ON UPDATE CASCADE;
