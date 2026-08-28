-- AlterTable
ALTER TABLE "Articulo" ADD COLUMN     "requiereReceta" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "esPsicotropico" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Lote" ADD COLUMN     "serialUnidad" VARCHAR(60),
ADD COLUMN     "codigoDatamatrix" VARCHAR(200);

-- CreateTable
CREATE TABLE "RecetaDispensacion" (
    "id" SERIAL NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "facturaId" INTEGER,
    "clienteId" INTEGER,
    "numeroReceta" VARCHAR(40) NOT NULL,
    "medicoNombre" VARCHAR(120) NOT NULL,
    "matricula" VARCHAR(40) NOT NULL,
    "fechaReceta" DATE NOT NULL,
    "observaciones" VARCHAR(500),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RecetaDispensacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LibroPsicotropicoMovimiento" (
    "id" SERIAL NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "articuloId" INTEGER NOT NULL,
    "loteId" INTEGER,
    "recetaId" INTEGER,
    "tipo" VARCHAR(10) NOT NULL,
    "cantidad" DECIMAL(14,4) NOT NULL,
    "referencia" VARCHAR(60),
    "observaciones" VARCHAR(300),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LibroPsicotropicoMovimiento_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RecetaDispensacion_tenantId_idx" ON "RecetaDispensacion"("tenantId");

-- CreateIndex
CREATE INDEX "RecetaDispensacion_tenantId_facturaId_idx" ON "RecetaDispensacion"("tenantId", "facturaId");

-- CreateIndex
CREATE INDEX "RecetaDispensacion_tenantId_clienteId_idx" ON "RecetaDispensacion"("tenantId", "clienteId");

-- CreateIndex
CREATE INDEX "RecetaDispensacion_tenantId_fechaReceta_idx" ON "RecetaDispensacion"("tenantId", "fechaReceta");

-- CreateIndex
CREATE UNIQUE INDEX "RecetaDispensacion_tenantId_numeroReceta_key" ON "RecetaDispensacion"("tenantId", "numeroReceta");

-- CreateIndex
CREATE INDEX "LibroPsicotropicoMovimiento_tenantId_idx" ON "LibroPsicotropicoMovimiento"("tenantId");

-- CreateIndex
CREATE INDEX "LibroPsicotropicoMovimiento_tenantId_createdAt_idx" ON "LibroPsicotropicoMovimiento"("tenantId", "createdAt");

-- CreateIndex
CREATE INDEX "LibroPsicotropicoMovimiento_tenantId_articuloId_createdAt_idx" ON "LibroPsicotropicoMovimiento"("tenantId", "articuloId", "createdAt");

-- CreateIndex
CREATE INDEX "LibroPsicotropicoMovimiento_tenantId_tipo_idx" ON "LibroPsicotropicoMovimiento"("tenantId", "tipo");

-- AddForeignKey
ALTER TABLE "RecetaDispensacion" ADD CONSTRAINT "RecetaDispensacion_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecetaDispensacion" ADD CONSTRAINT "RecetaDispensacion_facturaId_fkey" FOREIGN KEY ("facturaId") REFERENCES "Factura"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecetaDispensacion" ADD CONSTRAINT "RecetaDispensacion_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LibroPsicotropicoMovimiento" ADD CONSTRAINT "LibroPsicotropicoMovimiento_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LibroPsicotropicoMovimiento" ADD CONSTRAINT "LibroPsicotropicoMovimiento_articuloId_fkey" FOREIGN KEY ("articuloId") REFERENCES "Articulo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LibroPsicotropicoMovimiento" ADD CONSTRAINT "LibroPsicotropicoMovimiento_loteId_fkey" FOREIGN KEY ("loteId") REFERENCES "Lote"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LibroPsicotropicoMovimiento" ADD CONSTRAINT "LibroPsicotropicoMovimiento_recetaId_fkey" FOREIGN KEY ("recetaId") REFERENCES "RecetaDispensacion"("id") ON DELETE SET NULL ON UPDATE CASCADE;
