-- CreateTable
CREATE TABLE "ProveedorArticulo" (
    "id" SERIAL NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "proveedorId" INTEGER NOT NULL,
    "articuloId" INTEGER NOT NULL,
    "codigoProveedor" VARCHAR(50) NOT NULL,
    "descripcion" VARCHAR(120),
    "precioLista" DECIMAL(14,2),
    "precioListaFecha" TIMESTAMP(3),
    "unidadCompra" VARCHAR(30),
    "multiplo" DECIMAL(10,2) NOT NULL DEFAULT 1,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProveedorArticulo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProveedorArticulo_tenantId_proveedorId_articuloId_key" ON "ProveedorArticulo"("tenantId", "proveedorId", "articuloId");

-- CreateIndex
CREATE UNIQUE INDEX "ProveedorArticulo_tenantId_proveedorId_codigoProveedor_key" ON "ProveedorArticulo"("tenantId", "proveedorId", "codigoProveedor");

-- CreateIndex
CREATE INDEX "ProveedorArticulo_tenantId_proveedorId_idx" ON "ProveedorArticulo"("tenantId", "proveedorId");

-- CreateIndex
CREATE INDEX "ProveedorArticulo_tenantId_articuloId_idx" ON "ProveedorArticulo"("tenantId", "articuloId");

-- AddForeignKey
ALTER TABLE "ProveedorArticulo" ADD CONSTRAINT "ProveedorArticulo_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProveedorArticulo" ADD CONSTRAINT "ProveedorArticulo_proveedorId_fkey" FOREIGN KEY ("proveedorId") REFERENCES "Proveedor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProveedorArticulo" ADD CONSTRAINT "ProveedorArticulo_articuloId_fkey" FOREIGN KEY ("articuloId") REFERENCES "Articulo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
