-- AlterTable
ALTER TABLE "Proveedor" ADD COLUMN     "cbu" VARCHAR(22),
ADD COLUMN     "alias" VARCHAR(20),
ADD COLUMN     "banco" VARCHAR(50),
ADD COLUMN     "tipoCuenta" VARCHAR(2),
ADD COLUMN     "moneda" VARCHAR(3) NOT NULL DEFAULT 'ARS',
ADD COLUMN     "condicionPago" VARCHAR(10),
ADD COLUMN     "plazoHabitual" INTEGER,
ADD COLUMN     "descuentoPct" DECIMAL(5,2),
ADD COLUMN     "limiteCredito" DECIMAL(14,2),
ADD COLUMN     "categoria" VARCHAR(20),
ADD COLUMN     "contactoNombre" VARCHAR(50),
ADD COLUMN     "contactoEmail" VARCHAR(50),
ADD COLUMN     "contactoTel" VARCHAR(25),
ADD COLUMN     "notas" TEXT;

-- CreateIndex
CREATE INDEX "Proveedor_tenantId_activo_idx" ON "Proveedor"("tenantId", "activo");

-- CreateIndex
CREATE INDEX "Proveedor_tenantId_categoria_idx" ON "Proveedor"("tenantId", "categoria");
