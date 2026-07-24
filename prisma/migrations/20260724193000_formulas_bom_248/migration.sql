-- FormulaProduccion / FormulaInsumo for production BOM (#248)
CREATE TABLE "FormulaProduccion" (
    "id" SERIAL NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "articuloId" INTEGER NOT NULL,
    "rendimiento" DECIMAL(14,4) NOT NULL DEFAULT 1,
    "unidadRendimiento" VARCHAR(12) NOT NULL DEFAULT 'unidad',
    "version" INTEGER NOT NULL DEFAULT 1,
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "observaciones" VARCHAR(500),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FormulaProduccion_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "FormulaInsumo" (
    "id" SERIAL NOT NULL,
    "formulaId" INTEGER NOT NULL,
    "articuloId" INTEGER NOT NULL,
    "cantidad" DECIMAL(14,4) NOT NULL,
    "unidad" VARCHAR(12) NOT NULL,
    "esOpcional" BOOLEAN NOT NULL DEFAULT false,
    "orden" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "FormulaInsumo_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "FormulaProduccion_tenantId_idx" ON "FormulaProduccion"("tenantId");
CREATE INDEX "FormulaProduccion_tenantId_articuloId_idx" ON "FormulaProduccion"("tenantId", "articuloId");
CREATE INDEX "FormulaProduccion_tenantId_articuloId_activa_idx" ON "FormulaProduccion"("tenantId", "articuloId", "activa");
CREATE INDEX "FormulaProduccion_tenantId_activa_idx" ON "FormulaProduccion"("tenantId", "activa");
CREATE INDEX "FormulaInsumo_formulaId_idx" ON "FormulaInsumo"("formulaId");
CREATE INDEX "FormulaInsumo_articuloId_idx" ON "FormulaInsumo"("articuloId");

ALTER TABLE "FormulaProduccion" ADD CONSTRAINT "FormulaProduccion_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "FormulaProduccion" ADD CONSTRAINT "FormulaProduccion_articuloId_fkey" FOREIGN KEY ("articuloId") REFERENCES "Articulo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "FormulaInsumo" ADD CONSTRAINT "FormulaInsumo_formulaId_fkey" FOREIGN KEY ("formulaId") REFERENCES "FormulaProduccion"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "FormulaInsumo" ADD CONSTRAINT "FormulaInsumo_articuloId_fkey" FOREIGN KEY ("articuloId") REFERENCES "Articulo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
