-- CreateTable
CREATE TABLE "DocumentoCompraImportado" (
    "id" SERIAL NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "archivoNombre" VARCHAR(255) NOT NULL,
    "archivoMime" VARCHAR(100) NOT NULL,
    "archivoPath" VARCHAR(500) NOT NULL,
    "tipoArchivo" VARCHAR(10) NOT NULL,
    "tier" INTEGER NOT NULL DEFAULT 0,
    "confianza" DECIMAL(3,2) NOT NULL DEFAULT 0,
    "estado" VARCHAR(30) NOT NULL,
    "datosExtraidos" JSONB NOT NULL,
    "comprobanteCompraId" INTEGER,
    "errores" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DocumentoCompraImportado_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DocumentoCompraImportado_comprobanteCompraId_key" ON "DocumentoCompraImportado"("comprobanteCompraId");

-- CreateIndex
CREATE INDEX "DocumentoCompraImportado_tenantId_estado_idx" ON "DocumentoCompraImportado"("tenantId", "estado");

-- CreateIndex
CREATE INDEX "DocumentoCompraImportado_tenantId_usuarioId_idx" ON "DocumentoCompraImportado"("tenantId", "usuarioId");

-- AddForeignKey
ALTER TABLE "DocumentoCompraImportado" ADD CONSTRAINT "DocumentoCompraImportado_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentoCompraImportado" ADD CONSTRAINT "DocumentoCompraImportado_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "AppUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentoCompraImportado" ADD CONSTRAINT "DocumentoCompraImportado_comprobanteCompraId_fkey" FOREIGN KEY ("comprobanteCompraId") REFERENCES "ComprobanteCompra"("id") ON DELETE SET NULL ON UPDATE CASCADE;
