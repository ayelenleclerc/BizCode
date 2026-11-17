-- CreateTable
CREATE TABLE "ObraSocial" (
    "id" SERIAL NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "nombre" VARCHAR(120) NOT NULL,
    "codigo" VARCHAR(40) NOT NULL,
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ObraSocial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CoberturaOS" (
    "id" SERIAL NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "obraSocialId" INTEGER NOT NULL,
    "tipoProducto" VARCHAR(20) NOT NULL,
    "cobertura" DECIMAL(5,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CoberturaOS_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PresentacionOS" (
    "id" SERIAL NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "obraSocialId" INTEGER NOT NULL,
    "periodo" VARCHAR(7) NOT NULL,
    "totalCredito" DECIMAL(14,2) NOT NULL,
    "estado" VARCHAR(20) NOT NULL,
    "archivoCsvName" VARCHAR(200),
    "fechaPago" TIMESTAMP(3),
    "importeCobrado" DECIMAL(14,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PresentacionOS_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VentaConOS" (
    "id" SERIAL NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "facturaId" INTEGER,
    "clienteId" INTEGER NOT NULL,
    "obraSocialId" INTEGER NOT NULL,
    "nroAfiliado" VARCHAR(40) NOT NULL,
    "nroReceta" VARCHAR(40),
    "totalVenta" DECIMAL(14,2) NOT NULL,
    "copagoPaciente" DECIMAL(14,2) NOT NULL,
    "creditoOS" DECIMAL(14,2) NOT NULL,
    "estado" VARCHAR(30) NOT NULL,
    "presentacionId" INTEGER,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VentaConOS_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VentaOSItem" (
    "id" SERIAL NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "ventaConOSId" INTEGER NOT NULL,
    "articuloId" INTEGER,
    "descripcion" VARCHAR(200) NOT NULL,
    "tipoProducto" VARCHAR(20) NOT NULL,
    "cantidad" DECIMAL(14,4) NOT NULL,
    "precioUnitario" DECIMAL(14,2) NOT NULL,
    "subtotal" DECIMAL(14,2) NOT NULL,
    "coberturaPct" DECIMAL(5,2) NOT NULL,
    "creditoOS" DECIMAL(14,2) NOT NULL,
    "copago" DECIMAL(14,2) NOT NULL,

    CONSTRAINT "VentaOSItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PresentacionOSRechazo" (
    "id" SERIAL NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "presentacionId" INTEGER NOT NULL,
    "ventaConOSId" INTEGER NOT NULL,
    "ventaOSItemId" INTEGER,
    "importeRechazado" DECIMAL(14,2) NOT NULL,
    "motivo" VARCHAR(300),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PresentacionOSRechazo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ObraSocial_tenantId_idx" ON "ObraSocial"("tenantId");

-- CreateIndex
CREATE INDEX "ObraSocial_tenantId_activa_idx" ON "ObraSocial"("tenantId", "activa");

-- CreateIndex
CREATE UNIQUE INDEX "ObraSocial_tenantId_codigo_key" ON "ObraSocial"("tenantId", "codigo");

-- CreateIndex
CREATE INDEX "CoberturaOS_tenantId_idx" ON "CoberturaOS"("tenantId");

-- CreateIndex
CREATE INDEX "CoberturaOS_tenantId_obraSocialId_idx" ON "CoberturaOS"("tenantId", "obraSocialId");

-- CreateIndex
CREATE UNIQUE INDEX "CoberturaOS_obraSocialId_tipoProducto_key" ON "CoberturaOS"("obraSocialId", "tipoProducto");

-- CreateIndex
CREATE INDEX "PresentacionOS_tenantId_idx" ON "PresentacionOS"("tenantId");

-- CreateIndex
CREATE INDEX "PresentacionOS_tenantId_obraSocialId_idx" ON "PresentacionOS"("tenantId", "obraSocialId");

-- CreateIndex
CREATE UNIQUE INDEX "PresentacionOS_tenantId_obraSocialId_periodo_key" ON "PresentacionOS"("tenantId", "obraSocialId", "periodo");

-- CreateIndex
CREATE INDEX "VentaConOS_tenantId_idx" ON "VentaConOS"("tenantId");

-- CreateIndex
CREATE INDEX "VentaConOS_tenantId_obraSocialId_estado_idx" ON "VentaConOS"("tenantId", "obraSocialId", "estado");

-- CreateIndex
CREATE INDEX "VentaConOS_tenantId_presentacionId_idx" ON "VentaConOS"("tenantId", "presentacionId");

-- CreateIndex
CREATE INDEX "VentaConOS_tenantId_fecha_idx" ON "VentaConOS"("tenantId", "fecha");

-- CreateIndex
CREATE INDEX "VentaConOS_tenantId_clienteId_idx" ON "VentaConOS"("tenantId", "clienteId");

-- CreateIndex
CREATE INDEX "VentaConOS_tenantId_facturaId_idx" ON "VentaConOS"("tenantId", "facturaId");

-- CreateIndex
CREATE INDEX "VentaOSItem_tenantId_idx" ON "VentaOSItem"("tenantId");

-- CreateIndex
CREATE INDEX "VentaOSItem_tenantId_ventaConOSId_idx" ON "VentaOSItem"("tenantId", "ventaConOSId");

-- CreateIndex
CREATE INDEX "PresentacionOSRechazo_tenantId_idx" ON "PresentacionOSRechazo"("tenantId");

-- CreateIndex
CREATE INDEX "PresentacionOSRechazo_tenantId_presentacionId_idx" ON "PresentacionOSRechazo"("tenantId", "presentacionId");

-- CreateIndex
CREATE INDEX "PresentacionOSRechazo_tenantId_ventaConOSId_idx" ON "PresentacionOSRechazo"("tenantId", "ventaConOSId");

-- AddForeignKey
ALTER TABLE "ObraSocial" ADD CONSTRAINT "ObraSocial_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoberturaOS" ADD CONSTRAINT "CoberturaOS_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoberturaOS" ADD CONSTRAINT "CoberturaOS_obraSocialId_fkey" FOREIGN KEY ("obraSocialId") REFERENCES "ObraSocial"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PresentacionOS" ADD CONSTRAINT "PresentacionOS_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PresentacionOS" ADD CONSTRAINT "PresentacionOS_obraSocialId_fkey" FOREIGN KEY ("obraSocialId") REFERENCES "ObraSocial"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VentaConOS" ADD CONSTRAINT "VentaConOS_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VentaConOS" ADD CONSTRAINT "VentaConOS_facturaId_fkey" FOREIGN KEY ("facturaId") REFERENCES "Factura"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VentaConOS" ADD CONSTRAINT "VentaConOS_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VentaConOS" ADD CONSTRAINT "VentaConOS_obraSocialId_fkey" FOREIGN KEY ("obraSocialId") REFERENCES "ObraSocial"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VentaConOS" ADD CONSTRAINT "VentaConOS_presentacionId_fkey" FOREIGN KEY ("presentacionId") REFERENCES "PresentacionOS"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VentaOSItem" ADD CONSTRAINT "VentaOSItem_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VentaOSItem" ADD CONSTRAINT "VentaOSItem_ventaConOSId_fkey" FOREIGN KEY ("ventaConOSId") REFERENCES "VentaConOS"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VentaOSItem" ADD CONSTRAINT "VentaOSItem_articuloId_fkey" FOREIGN KEY ("articuloId") REFERENCES "Articulo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PresentacionOSRechazo" ADD CONSTRAINT "PresentacionOSRechazo_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PresentacionOSRechazo" ADD CONSTRAINT "PresentacionOSRechazo_presentacionId_fkey" FOREIGN KEY ("presentacionId") REFERENCES "PresentacionOS"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PresentacionOSRechazo" ADD CONSTRAINT "PresentacionOSRechazo_ventaConOSId_fkey" FOREIGN KEY ("ventaConOSId") REFERENCES "VentaConOS"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
