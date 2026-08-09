-- Issue #170: App Seller daily visit agenda (VisitaVendedor).

CREATE TABLE "VisitaVendedor" (
    "id" SERIAL NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "vendedorId" INTEGER NOT NULL,
    "clienteId" INTEGER NOT NULL,
    "fechaPlanificada" DATE NOT NULL,
    "estadoPlan" VARCHAR(20) NOT NULL DEFAULT 'pendiente',
    "resultado" VARCHAR(20),
    "notasVisita" VARCHAR(500),
    "pedidoId" INTEGER,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "duracionMinutos" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VisitaVendedor_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "VisitaVendedor_tenantId_vendedorId_fechaPlanificada_idx" ON "VisitaVendedor"("tenantId", "vendedorId", "fechaPlanificada");
CREATE INDEX "VisitaVendedor_tenantId_clienteId_idx" ON "VisitaVendedor"("tenantId", "clienteId");
CREATE INDEX "VisitaVendedor_tenantId_pedidoId_idx" ON "VisitaVendedor"("tenantId", "pedidoId");

ALTER TABLE "VisitaVendedor" ADD CONSTRAINT "VisitaVendedor_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "VisitaVendedor" ADD CONSTRAINT "VisitaVendedor_vendedorId_fkey" FOREIGN KEY ("vendedorId") REFERENCES "AppUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "VisitaVendedor" ADD CONSTRAINT "VisitaVendedor_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "VisitaVendedor" ADD CONSTRAINT "VisitaVendedor_pedidoId_fkey" FOREIGN KEY ("pedidoId") REFERENCES "Pedido"("id") ON DELETE SET NULL ON UPDATE CASCADE;
