-- AlterTable
ALTER TABLE "Factura" ADD COLUMN "contratoId" INTEGER;

-- CreateTable
CREATE TABLE "Contrato" (
    "id" SERIAL NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "numero" INTEGER NOT NULL,
    "clienteId" INTEGER NOT NULL,
    "nombre" VARCHAR(120) NOT NULL,
    "descripcion" VARCHAR(500),
    "estado" VARCHAR(20) NOT NULL DEFAULT 'activo',
    "frecuencia" VARCHAR(20) NOT NULL DEFAULT 'mensual',
    "diaDelMes" INTEGER NOT NULL DEFAULT 1,
    "fechaInicio" TIMESTAMP(3) NOT NULL,
    "fechaFin" TIMESTAMP(3),
    "proximaFact" TIMESTAMP(3) NOT NULL,
    "montoBase" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "moneda" VARCHAR(3) NOT NULL DEFAULT 'ARS',
    "incluyeIVA" BOOLEAN NOT NULL DEFAULT false,
    "ivaAlicuota" DECIMAL(5,2) NOT NULL DEFAULT 21,
    "modoEmision" VARCHAR(20) NOT NULL DEFAULT 'revision',
    "tipoFactura" VARCHAR(1) NOT NULL DEFAULT 'B',
    "prefijo" VARCHAR(4) NOT NULL DEFAULT '0001',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Contrato_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContratoItem" (
    "id" SERIAL NOT NULL,
    "contratoId" INTEGER NOT NULL,
    "articuloId" INTEGER,
    "descripcion" VARCHAR(120) NOT NULL,
    "condIva" VARCHAR(1) NOT NULL DEFAULT '1',
    "unidadServicio" VARCHAR(12),
    "cantidad" INTEGER NOT NULL DEFAULT 1,
    "precioUnit" DECIMAL(14,2) NOT NULL,
    "dscto" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContratoItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContratoAjuste" (
    "id" SERIAL NOT NULL,
    "contratoId" INTEGER NOT NULL,
    "tipo" VARCHAR(20) NOT NULL,
    "porcentaje" DECIMAL(8,4),
    "frecuenciaAjuste" VARCHAR(20) NOT NULL,
    "proximoAjuste" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContratoAjuste_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Contrato_tenantId_numero_key" ON "Contrato"("tenantId", "numero");

-- CreateIndex
CREATE INDEX "Contrato_tenantId_estado_idx" ON "Contrato"("tenantId", "estado");

-- CreateIndex
CREATE INDEX "Contrato_tenantId_proximaFact_idx" ON "Contrato"("tenantId", "proximaFact");

-- CreateIndex
CREATE INDEX "Contrato_tenantId_clienteId_idx" ON "Contrato"("tenantId", "clienteId");

-- CreateIndex
CREATE INDEX "ContratoItem_contratoId_idx" ON "ContratoItem"("contratoId");

-- CreateIndex
CREATE UNIQUE INDEX "ContratoAjuste_contratoId_key" ON "ContratoAjuste"("contratoId");

-- CreateIndex
CREATE INDEX "Factura_tenantId_contratoId_idx" ON "Factura"("tenantId", "contratoId");

-- AddForeignKey
ALTER TABLE "Factura" ADD CONSTRAINT "Factura_contratoId_fkey" FOREIGN KEY ("contratoId") REFERENCES "Contrato"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contrato" ADD CONSTRAINT "Contrato_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contrato" ADD CONSTRAINT "Contrato_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContratoItem" ADD CONSTRAINT "ContratoItem_contratoId_fkey" FOREIGN KEY ("contratoId") REFERENCES "Contrato"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContratoItem" ADD CONSTRAINT "ContratoItem_articuloId_fkey" FOREIGN KEY ("articuloId") REFERENCES "Articulo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContratoAjuste" ADD CONSTRAINT "ContratoAjuste_contratoId_fkey" FOREIGN KEY ("contratoId") REFERENCES "Contrato"("id") ON DELETE CASCADE ON UPDATE CASCADE;
