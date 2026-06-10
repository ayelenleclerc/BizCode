-- CreateTable
CREATE TABLE "Cheque" (
    "id" SERIAL NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "tipo" VARCHAR(20) NOT NULL,
    "modalidad" VARCHAR(10) NOT NULL,
    "numero" VARCHAR(30) NOT NULL,
    "banco" VARCHAR(50) NOT NULL,
    "sucursal" VARCHAR(30),
    "cbuOrigen" VARCHAR(22),
    "libradorNombre" VARCHAR(80) NOT NULL,
    "libradorCuit" VARCHAR(14),
    "monto" DECIMAL(14,2) NOT NULL,
    "moneda" VARCHAR(3) NOT NULL DEFAULT 'ARS',
    "fechaEmision" TIMESTAMP(3) NOT NULL,
    "fechaVencimiento" TIMESTAMP(3) NOT NULL,
    "estado" VARCHAR(20) NOT NULL,
    "clienteId" INTEGER,
    "proveedorId" INTEGER,
    "observaciones" VARCHAR(500),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Cheque_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChequeMov" (
    "id" SERIAL NOT NULL,
    "chequeId" INTEGER NOT NULL,
    "tipo" VARCHAR(20) NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "monto" DECIMAL(14,2),
    "destino" VARCHAR(120),
    "nota" VARCHAR(500),
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChequeMov_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "Cobro" ADD COLUMN "chequeId" INTEGER;

-- AlterTable
ALTER TABLE "ReciboPago" ADD COLUMN "chequeId" INTEGER;

-- CreateIndex
CREATE INDEX "Cheque_tenantId_estado_idx" ON "Cheque"("tenantId", "estado");

-- CreateIndex
CREATE INDEX "Cheque_tenantId_tipo_idx" ON "Cheque"("tenantId", "tipo");

-- CreateIndex
CREATE INDEX "Cheque_tenantId_fechaVencimiento_idx" ON "Cheque"("tenantId", "fechaVencimiento");

-- CreateIndex
CREATE UNIQUE INDEX "Cheque_tenantId_banco_numero_key" ON "Cheque"("tenantId", "banco", "numero");

-- CreateIndex
CREATE INDEX "ChequeMov_chequeId_idx" ON "ChequeMov"("chequeId");

-- AddForeignKey
ALTER TABLE "Cheque" ADD CONSTRAINT "Cheque_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cheque" ADD CONSTRAINT "Cheque_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cheque" ADD CONSTRAINT "Cheque_proveedorId_fkey" FOREIGN KEY ("proveedorId") REFERENCES "Proveedor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChequeMov" ADD CONSTRAINT "ChequeMov_chequeId_fkey" FOREIGN KEY ("chequeId") REFERENCES "Cheque"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChequeMov" ADD CONSTRAINT "ChequeMov_userId_fkey" FOREIGN KEY ("userId") REFERENCES "AppUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cobro" ADD CONSTRAINT "Cobro_chequeId_fkey" FOREIGN KEY ("chequeId") REFERENCES "Cheque"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReciboPago" ADD CONSTRAINT "ReciboPago_chequeId_fkey" FOREIGN KEY ("chequeId") REFERENCES "Cheque"("id") ON DELETE SET NULL ON UPDATE CASCADE;
