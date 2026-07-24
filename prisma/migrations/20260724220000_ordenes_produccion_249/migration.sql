-- OrdenProduccion / OrdenProduccionInsumo / StockReservaProduccion for production orders (#249)
CREATE TABLE "OrdenProduccion" (
    "id" SERIAL NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "numero" INTEGER NOT NULL,
    "articuloId" INTEGER NOT NULL,
    "formulaId" INTEGER NOT NULL,
    "depositoId" INTEGER NOT NULL,
    "cantidadPlanif" DECIMAL(14,4) NOT NULL,
    "cantidadReal" DECIMAL(14,4),
    "estado" VARCHAR(20) NOT NULL DEFAULT 'planificada',
    "fechaPlanif" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaInicio" TIMESTAMP(3),
    "fechaFin" TIMESTAMP(3),
    "costoTotal" DECIMAL(14,2),
    "operadorId" INTEGER,
    "observaciones" VARCHAR(500),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrdenProduccion_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "OrdenProduccionInsumo" (
    "id" SERIAL NOT NULL,
    "ordenId" INTEGER NOT NULL,
    "articuloId" INTEGER NOT NULL,
    "cantidadPlan" DECIMAL(14,4) NOT NULL,
    "cantidadReal" DECIMAL(14,4),
    "unidad" VARCHAR(12) NOT NULL,
    "costo" DECIMAL(14,2),
    "esOpcional" BOOLEAN NOT NULL DEFAULT false,
    "linea" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "OrdenProduccionInsumo_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "StockReservaProduccion" (
    "id" SERIAL NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "ordenId" INTEGER NOT NULL,
    "articuloId" INTEGER NOT NULL,
    "depositoId" INTEGER NOT NULL,
    "cantidad" DECIMAL(14,4) NOT NULL,
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "releasedAt" TIMESTAMP(3),

    CONSTRAINT "StockReservaProduccion_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "OrdenProduccion_tenantId_numero_key" ON "OrdenProduccion"("tenantId", "numero");
CREATE INDEX "OrdenProduccion_tenantId_idx" ON "OrdenProduccion"("tenantId");
CREATE INDEX "OrdenProduccion_tenantId_estado_idx" ON "OrdenProduccion"("tenantId", "estado");
CREATE INDEX "OrdenProduccion_tenantId_articuloId_idx" ON "OrdenProduccion"("tenantId", "articuloId");
CREATE INDEX "OrdenProduccion_tenantId_depositoId_estado_idx" ON "OrdenProduccion"("tenantId", "depositoId", "estado");
CREATE INDEX "OrdenProduccion_tenantId_fechaPlanif_idx" ON "OrdenProduccion"("tenantId", "fechaPlanif");
CREATE INDEX "OrdenProduccionInsumo_ordenId_idx" ON "OrdenProduccionInsumo"("ordenId");
CREATE INDEX "OrdenProduccionInsumo_articuloId_idx" ON "OrdenProduccionInsumo"("articuloId");
CREATE INDEX "StockReservaProduccion_ordenId_idx" ON "StockReservaProduccion"("ordenId");
CREATE INDEX "StockReservaProduccion_tenantId_articuloId_depositoId_activa_idx" ON "StockReservaProduccion"("tenantId", "articuloId", "depositoId", "activa");
CREATE INDEX "StockReservaProduccion_tenantId_activa_idx" ON "StockReservaProduccion"("tenantId", "activa");

ALTER TABLE "OrdenProduccion" ADD CONSTRAINT "OrdenProduccion_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "OrdenProduccion" ADD CONSTRAINT "OrdenProduccion_articuloId_fkey" FOREIGN KEY ("articuloId") REFERENCES "Articulo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "OrdenProduccion" ADD CONSTRAINT "OrdenProduccion_formulaId_fkey" FOREIGN KEY ("formulaId") REFERENCES "FormulaProduccion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "OrdenProduccion" ADD CONSTRAINT "OrdenProduccion_depositoId_fkey" FOREIGN KEY ("depositoId") REFERENCES "Deposito"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "OrdenProduccion" ADD CONSTRAINT "OrdenProduccion_operadorId_fkey" FOREIGN KEY ("operadorId") REFERENCES "AppUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "OrdenProduccionInsumo" ADD CONSTRAINT "OrdenProduccionInsumo_ordenId_fkey" FOREIGN KEY ("ordenId") REFERENCES "OrdenProduccion"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "OrdenProduccionInsumo" ADD CONSTRAINT "OrdenProduccionInsumo_articuloId_fkey" FOREIGN KEY ("articuloId") REFERENCES "Articulo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "StockReservaProduccion" ADD CONSTRAINT "StockReservaProduccion_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "StockReservaProduccion" ADD CONSTRAINT "StockReservaProduccion_ordenId_fkey" FOREIGN KEY ("ordenId") REFERENCES "OrdenProduccion"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "StockReservaProduccion" ADD CONSTRAINT "StockReservaProduccion_articuloId_fkey" FOREIGN KEY ("articuloId") REFERENCES "Articulo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "StockReservaProduccion" ADD CONSTRAINT "StockReservaProduccion_depositoId_fkey" FOREIGN KEY ("depositoId") REFERENCES "Deposito"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
