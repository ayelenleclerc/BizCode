-- CreateTable
CREATE TABLE "OrdenTrabajo" (
    "id" SERIAL NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "numero" INTEGER NOT NULL,
    "clienteId" INTEGER NOT NULL,
    "tecnicoId" INTEGER,
    "estado" VARCHAR(20) NOT NULL DEFAULT 'recibido',
    "prioridad" VARCHAR(12) NOT NULL DEFAULT 'normal',
    "equipoMarca" VARCHAR(60),
    "equipoModelo" VARCHAR(60),
    "equipoNroSerie" VARCHAR(80),
    "equipoDescripcion" VARCHAR(200) NOT NULL,
    "sintomaReportado" VARCHAR(500) NOT NULL,
    "diagnostico" VARCHAR(1000),
    "trabajoRealizado" VARCHAR(1000),
    "enGarantia" BOOLEAN NOT NULL DEFAULT false,
    "garantiaVence" TIMESTAMP(3),
    "otGarantiaId" INTEGER,
    "presupuesto" DECIMAL(14,2),
    "fechaIngreso" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaPromesa" TIMESTAMP(3),
    "fechaEntrega" TIMESTAMP(3),
    "facturaId" INTEGER,
    "observaciones" VARCHAR(1000),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrdenTrabajo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrdenTrabajoItem" (
    "id" SERIAL NOT NULL,
    "otId" INTEGER NOT NULL,
    "tipo" VARCHAR(20) NOT NULL,
    "descripcion" VARCHAR(120) NOT NULL,
    "articuloId" INTEGER,
    "cantidad" DECIMAL(14,4) NOT NULL,
    "precioUnit" DECIMAL(14,2) NOT NULL,
    "subtotal" DECIMAL(14,2) NOT NULL,
    "condIva" VARCHAR(1) NOT NULL DEFAULT '1',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrdenTrabajoItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OrdenTrabajo_tenantId_numero_key" ON "OrdenTrabajo"("tenantId", "numero");

-- CreateIndex
CREATE INDEX "OrdenTrabajo_tenantId_estado_idx" ON "OrdenTrabajo"("tenantId", "estado");

-- CreateIndex
CREATE INDEX "OrdenTrabajo_tenantId_clienteId_idx" ON "OrdenTrabajo"("tenantId", "clienteId");

-- CreateIndex
CREATE INDEX "OrdenTrabajo_tenantId_tecnicoId_idx" ON "OrdenTrabajo"("tenantId", "tecnicoId");

-- CreateIndex
CREATE INDEX "OrdenTrabajo_tenantId_equipoNroSerie_idx" ON "OrdenTrabajo"("tenantId", "equipoNroSerie");

-- CreateIndex
CREATE INDEX "OrdenTrabajo_tenantId_facturaId_idx" ON "OrdenTrabajo"("tenantId", "facturaId");

-- CreateIndex
CREATE INDEX "OrdenTrabajoItem_otId_idx" ON "OrdenTrabajoItem"("otId");

-- CreateIndex
CREATE INDEX "OrdenTrabajoItem_articuloId_idx" ON "OrdenTrabajoItem"("articuloId");

-- AddForeignKey
ALTER TABLE "OrdenTrabajo" ADD CONSTRAINT "OrdenTrabajo_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrdenTrabajo" ADD CONSTRAINT "OrdenTrabajo_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrdenTrabajo" ADD CONSTRAINT "OrdenTrabajo_tecnicoId_fkey" FOREIGN KEY ("tecnicoId") REFERENCES "AppUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrdenTrabajo" ADD CONSTRAINT "OrdenTrabajo_otGarantiaId_fkey" FOREIGN KEY ("otGarantiaId") REFERENCES "OrdenTrabajo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrdenTrabajo" ADD CONSTRAINT "OrdenTrabajo_facturaId_fkey" FOREIGN KEY ("facturaId") REFERENCES "Factura"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrdenTrabajoItem" ADD CONSTRAINT "OrdenTrabajoItem_otId_fkey" FOREIGN KEY ("otId") REFERENCES "OrdenTrabajo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrdenTrabajoItem" ADD CONSTRAINT "OrdenTrabajoItem_articuloId_fkey" FOREIGN KEY ("articuloId") REFERENCES "Articulo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
