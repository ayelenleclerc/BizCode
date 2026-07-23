-- Issue #234: múltiples listas de precios con precios escalonados por cantidad.

-- AlterTable
ALTER TABLE "Cliente" ADD COLUMN     "listaPrecioId" INTEGER;

-- CreateTable
CREATE TABLE "ListaPrecio" (
    "id" SERIAL NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "nombre" VARCHAR(80) NOT NULL,
    "moneda" VARCHAR(3) NOT NULL DEFAULT 'ARS',
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "esDefault" BOOLEAN NOT NULL DEFAULT false,
    "vigenciaHasta" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ListaPrecio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ListaPrecioItem" (
    "id" SERIAL NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "listaPrecioId" INTEGER NOT NULL,
    "articuloId" INTEGER NOT NULL,
    "tipoPrecio" VARCHAR(24) NOT NULL,
    "precio" DECIMAL(14,2),
    "porcentaje" DECIMAL(7,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ListaPrecioItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PrecioEscalonado" (
    "id" SERIAL NOT NULL,
    "listaPrecioItemId" INTEGER NOT NULL,
    "cantidadDesde" DECIMAL(14,2) NOT NULL,
    "cantidadHasta" DECIMAL(14,2),
    "precio" DECIMAL(14,2) NOT NULL,

    CONSTRAINT "PrecioEscalonado_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ListaPrecio_tenantId_idx" ON "ListaPrecio"("tenantId");

-- CreateIndex
CREATE INDEX "ListaPrecio_tenantId_activa_idx" ON "ListaPrecio"("tenantId", "activa");

-- CreateIndex
CREATE UNIQUE INDEX "ListaPrecio_tenantId_nombre_key" ON "ListaPrecio"("tenantId", "nombre");

-- CreateIndex
CREATE INDEX "ListaPrecioItem_tenantId_idx" ON "ListaPrecioItem"("tenantId");

-- CreateIndex
CREATE INDEX "ListaPrecioItem_listaPrecioId_idx" ON "ListaPrecioItem"("listaPrecioId");

-- CreateIndex
CREATE INDEX "ListaPrecioItem_articuloId_idx" ON "ListaPrecioItem"("articuloId");

-- CreateIndex
CREATE UNIQUE INDEX "ListaPrecioItem_listaPrecioId_articuloId_key" ON "ListaPrecioItem"("listaPrecioId", "articuloId");

-- CreateIndex
CREATE INDEX "PrecioEscalonado_listaPrecioItemId_idx" ON "PrecioEscalonado"("listaPrecioItemId");

-- AddForeignKey
ALTER TABLE "Cliente" ADD CONSTRAINT "Cliente_listaPrecioId_fkey" FOREIGN KEY ("listaPrecioId") REFERENCES "ListaPrecio"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ListaPrecio" ADD CONSTRAINT "ListaPrecio_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ListaPrecioItem" ADD CONSTRAINT "ListaPrecioItem_listaPrecioId_fkey" FOREIGN KEY ("listaPrecioId") REFERENCES "ListaPrecio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ListaPrecioItem" ADD CONSTRAINT "ListaPrecioItem_articuloId_fkey" FOREIGN KEY ("articuloId") REFERENCES "Articulo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrecioEscalonado" ADD CONSTRAINT "PrecioEscalonado_listaPrecioItemId_fkey" FOREIGN KEY ("listaPrecioItemId") REFERENCES "ListaPrecioItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
