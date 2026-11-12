-- Tenant-configurable billing anomaly thresholds (#200 residual)
CREATE TABLE "ConfigAnomaliaFactura" (
    "id" SERIAL NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "minHistory" INTEGER NOT NULL DEFAULT 20,
    "zScoreThreshold" DECIMAL(8,4) NOT NULL DEFAULT 3,
    "discountThresholdPct" DECIMAL(8,2) NOT NULL DEFAULT 30,
    "newCustomerCreditFraction" DECIMAL(8,4) NOT NULL DEFAULT 0.5,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConfigAnomaliaFactura_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ConfigAnomaliaFactura_tenantId_key" ON "ConfigAnomaliaFactura"("tenantId");

ALTER TABLE "ConfigAnomaliaFactura" ADD CONSTRAINT "ConfigAnomaliaFactura_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
