-- CreateTable
CREATE TABLE "CuentaBancaria" (
    "id" SERIAL NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "banco" VARCHAR(50) NOT NULL,
    "tipoCuenta" VARCHAR(20) NOT NULL,
    "cbu" VARCHAR(22) NOT NULL,
    "alias" VARCHAR(60),
    "moneda" VARCHAR(3) NOT NULL DEFAULT 'ARS',
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CuentaBancaria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MovimientoBancario" (
    "id" SERIAL NOT NULL,
    "cuentaId" INTEGER NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "descripcion" VARCHAR(255) NOT NULL,
    "importe" DECIMAL(14,2) NOT NULL,
    "tipo" VARCHAR(10) NOT NULL,
    "saldo" DECIMAL(14,2),
    "referencia" VARCHAR(80),
    "formatoOrigen" VARCHAR(10) NOT NULL,
    "dedupeKey" VARCHAR(64) NOT NULL,
    "conciliadoId" INTEGER,
    "conciliadoAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MovimientoBancario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BancoCsvMapping" (
    "id" SERIAL NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "bancoCode" VARCHAR(30) NOT NULL,
    "columnaFecha" VARCHAR(60) NOT NULL,
    "columnaDescripcion" VARCHAR(60) NOT NULL,
    "columnaImporte" VARCHAR(60) NOT NULL,
    "columnaReferencia" VARCHAR(60),
    "columnaSaldo" VARCHAR(60),
    "separadorDecimal" VARCHAR(1) NOT NULL DEFAULT ',',
    "formatoFecha" VARCHAR(20) NOT NULL DEFAULT 'dd/MM/yyyy',
    "delimiter" VARCHAR(1) NOT NULL DEFAULT ';',
    "signoDebitoCredito" VARCHAR(30) NOT NULL DEFAULT 'signed_importe',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BancoCsvMapping_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CuentaBancaria_tenantId_activo_idx" ON "CuentaBancaria"("tenantId", "activo");

-- CreateIndex
CREATE UNIQUE INDEX "CuentaBancaria_tenantId_cbu_key" ON "CuentaBancaria"("tenantId", "cbu");

-- CreateIndex
CREATE INDEX "MovimientoBancario_cuentaId_fecha_idx" ON "MovimientoBancario"("cuentaId", "fecha");

-- CreateIndex
CREATE INDEX "MovimientoBancario_cuentaId_conciliadoAt_idx" ON "MovimientoBancario"("cuentaId", "conciliadoAt");

-- CreateIndex
CREATE UNIQUE INDEX "MovimientoBancario_cuentaId_dedupeKey_key" ON "MovimientoBancario"("cuentaId", "dedupeKey");

-- CreateIndex
CREATE INDEX "BancoCsvMapping_tenantId_idx" ON "BancoCsvMapping"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "BancoCsvMapping_tenantId_bancoCode_key" ON "BancoCsvMapping"("tenantId", "bancoCode");

-- AddForeignKey
ALTER TABLE "CuentaBancaria" ADD CONSTRAINT "CuentaBancaria_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovimientoBancario" ADD CONSTRAINT "MovimientoBancario_cuentaId_fkey" FOREIGN KEY ("cuentaId") REFERENCES "CuentaBancaria"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BancoCsvMapping" ADD CONSTRAINT "BancoCsvMapping_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
