-- AlterTable Cliente: bank CBU/alias for transfer matching (#191)
ALTER TABLE "Cliente" ADD COLUMN "cbu" VARCHAR(22),
ADD COLUMN "alias" VARCHAR(60);

-- CreateIndex
CREATE INDEX "Cliente_tenantId_cbu_idx" ON "Cliente"("tenantId", "cbu");

-- AlterTable MovimientoBancario: match state + conciliado tipo (#191)
ALTER TABLE "MovimientoBancario" ADD COLUMN "conciliadoTipo" VARCHAR(20),
ADD COLUMN "matchEstado" VARCHAR(20) NOT NULL DEFAULT 'unmatched',
ADD COLUMN "matchScore" DECIMAL(5,2),
ADD COLUMN "matchSugerencias" JSONB;

-- CreateIndex
CREATE INDEX "MovimientoBancario_cuentaId_matchEstado_idx" ON "MovimientoBancario"("cuentaId", "matchEstado");

-- CreateTable PeriodoBancarioLock
CREATE TABLE "PeriodoBancarioLock" (
    "id" SERIAL NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "cuentaId" INTEGER NOT NULL,
    "periodo" VARCHAR(7) NOT NULL,
    "lockedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lockedByUserId" INTEGER NOT NULL,

    CONSTRAINT "PeriodoBancarioLock_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PeriodoBancarioLock_tenantId_periodo_idx" ON "PeriodoBancarioLock"("tenantId", "periodo");

-- CreateIndex
CREATE UNIQUE INDEX "PeriodoBancarioLock_cuentaId_periodo_key" ON "PeriodoBancarioLock"("cuentaId", "periodo");

-- AddForeignKey
ALTER TABLE "PeriodoBancarioLock" ADD CONSTRAINT "PeriodoBancarioLock_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PeriodoBancarioLock" ADD CONSTRAINT "PeriodoBancarioLock_cuentaId_fkey" FOREIGN KEY ("cuentaId") REFERENCES "CuentaBancaria"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PeriodoBancarioLock" ADD CONSTRAINT "PeriodoBancarioLock_lockedByUserId_fkey" FOREIGN KEY ("lockedByUserId") REFERENCES "AppUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
