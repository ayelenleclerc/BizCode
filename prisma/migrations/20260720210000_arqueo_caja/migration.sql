-- AlterTable
ALTER TABLE "FormaPago" ADD COLUMN "esEfectivo" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "Caja" (
    "id" SERIAL NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "nombre" VARCHAR(80) NOT NULL,
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Caja_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TurnoCaja" (
    "id" SERIAL NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "cajaId" INTEGER NOT NULL,
    "cajeroId" INTEGER NOT NULL,
    "estado" VARCHAR(12) NOT NULL,
    "montoApertura" DECIMAL(14,2) NOT NULL,
    "fechaApertura" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaCierre" TIMESTAMP(3),
    "totalVentasEfectivo" DECIMAL(14,2),
    "totalVentasTarjeta" DECIMAL(14,2),
    "totalVentasMP" DECIMAL(14,2),
    "totalVentasTransf" DECIMAL(14,2),
    "totalEgresos" DECIMAL(14,2),
    "totalIngresosExtra" DECIMAL(14,2),
    "efectivoEsperado" DECIMAL(14,2),
    "efectivoContado" DECIMAL(14,2),
    "diferencia" DECIMAL(14,2),
    "observaciones" VARCHAR(500),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TurnoCaja_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConteoEfectivo" (
    "id" SERIAL NOT NULL,
    "turnoId" INTEGER NOT NULL,
    "b1000" INTEGER NOT NULL DEFAULT 0,
    "b500" INTEGER NOT NULL DEFAULT 0,
    "b200" INTEGER NOT NULL DEFAULT 0,
    "b100" INTEGER NOT NULL DEFAULT 0,
    "b50" INTEGER NOT NULL DEFAULT 0,
    "b20" INTEGER NOT NULL DEFAULT 0,
    "b10" INTEGER NOT NULL DEFAULT 0,
    "m10" INTEGER NOT NULL DEFAULT 0,
    "m5" INTEGER NOT NULL DEFAULT 0,
    "m2" INTEGER NOT NULL DEFAULT 0,
    "m1" INTEGER NOT NULL DEFAULT 0,
    "total" DECIMAL(14,2) NOT NULL,

    CONSTRAINT "ConteoEfectivo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MovimientoCaja" (
    "id" SERIAL NOT NULL,
    "turnoId" INTEGER NOT NULL,
    "tipo" VARCHAR(20) NOT NULL,
    "formaPago" VARCHAR(20) NOT NULL,
    "importe" DECIMAL(14,2) NOT NULL,
    "concepto" VARCHAR(200),
    "referenciaTipo" VARCHAR(20),
    "referenciaId" INTEGER,
    "userId" INTEGER NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MovimientoCaja_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Caja_tenantId_activa_idx" ON "Caja"("tenantId", "activa");

-- CreateIndex
CREATE UNIQUE INDEX "Caja_tenantId_nombre_key" ON "Caja"("tenantId", "nombre");

-- CreateIndex
CREATE INDEX "TurnoCaja_tenantId_estado_idx" ON "TurnoCaja"("tenantId", "estado");

-- CreateIndex
CREATE INDEX "TurnoCaja_tenantId_cajaId_idx" ON "TurnoCaja"("tenantId", "cajaId");

-- CreateIndex
CREATE INDEX "TurnoCaja_tenantId_cajeroId_idx" ON "TurnoCaja"("tenantId", "cajeroId");

-- CreateIndex
CREATE INDEX "TurnoCaja_tenantId_fechaApertura_idx" ON "TurnoCaja"("tenantId", "fechaApertura");

-- CreateIndex
CREATE UNIQUE INDEX "ConteoEfectivo_turnoId_key" ON "ConteoEfectivo"("turnoId");

-- CreateIndex
CREATE INDEX "MovimientoCaja_turnoId_idx" ON "MovimientoCaja"("turnoId");

-- CreateIndex
CREATE INDEX "MovimientoCaja_userId_idx" ON "MovimientoCaja"("userId");

-- CreateIndex
CREATE INDEX "MovimientoCaja_referenciaTipo_referenciaId_idx" ON "MovimientoCaja"("referenciaTipo", "referenciaId");

-- AddForeignKey
ALTER TABLE "Caja" ADD CONSTRAINT "Caja_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TurnoCaja" ADD CONSTRAINT "TurnoCaja_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TurnoCaja" ADD CONSTRAINT "TurnoCaja_cajaId_fkey" FOREIGN KEY ("cajaId") REFERENCES "Caja"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TurnoCaja" ADD CONSTRAINT "TurnoCaja_cajeroId_fkey" FOREIGN KEY ("cajeroId") REFERENCES "AppUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConteoEfectivo" ADD CONSTRAINT "ConteoEfectivo_turnoId_fkey" FOREIGN KEY ("turnoId") REFERENCES "TurnoCaja"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovimientoCaja" ADD CONSTRAINT "MovimientoCaja_turnoId_fkey" FOREIGN KEY ("turnoId") REFERENCES "TurnoCaja"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovimientoCaja" ADD CONSTRAINT "MovimientoCaja_userId_fkey" FOREIGN KEY ("userId") REFERENCES "AppUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
