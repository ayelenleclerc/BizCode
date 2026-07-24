-- Loyalty program: ConfigFidelizacion / PuntosFidelizacion / MovimientoPuntos (#250)
CREATE TABLE "ConfigFidelizacion" (
    "id" SERIAL NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT false,
    "nombre" VARCHAR(80) NOT NULL DEFAULT 'Programa de Puntos',
    "pesosPorPunto" DECIMAL(14,4) NOT NULL DEFAULT 100,
    "puntosPorPeso" DECIMAL(14,6) NOT NULL DEFAULT 0.01,
    "mesesVencimiento" INTEGER,
    "montoMinCompra" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "aplicaEnDescuento" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConfigFidelizacion_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PuntosFidelizacion" (
    "id" SERIAL NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "clienteId" INTEGER NOT NULL,
    "puntos" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PuntosFidelizacion_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "MovimientoPuntos" (
    "id" SERIAL NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "clienteId" INTEGER NOT NULL,
    "tipo" VARCHAR(20) NOT NULL,
    "puntos" INTEGER NOT NULL,
    "saldoPost" INTEGER NOT NULL,
    "puntosRestantes" INTEGER,
    "referenciaFacturaId" INTEGER,
    "venceEn" TIMESTAMP(3),
    "preavisoEnviadoAt" TIMESTAMP(3),
    "concepto" VARCHAR(200),
    "userId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MovimientoPuntos_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ConfigFidelizacion_tenantId_key" ON "ConfigFidelizacion"("tenantId");
CREATE UNIQUE INDEX "PuntosFidelizacion_clienteId_key" ON "PuntosFidelizacion"("clienteId");
CREATE UNIQUE INDEX "PuntosFidelizacion_tenantId_clienteId_key" ON "PuntosFidelizacion"("tenantId", "clienteId");
CREATE INDEX "PuntosFidelizacion_tenantId_idx" ON "PuntosFidelizacion"("tenantId");
CREATE INDEX "PuntosFidelizacion_tenantId_puntos_idx" ON "PuntosFidelizacion"("tenantId", "puntos");
CREATE INDEX "MovimientoPuntos_tenantId_clienteId_createdAt_idx" ON "MovimientoPuntos"("tenantId", "clienteId", "createdAt");
CREATE INDEX "MovimientoPuntos_tenantId_tipo_createdAt_idx" ON "MovimientoPuntos"("tenantId", "tipo", "createdAt");
CREATE INDEX "MovimientoPuntos_tenantId_referenciaFacturaId_idx" ON "MovimientoPuntos"("tenantId", "referenciaFacturaId");
CREATE INDEX "MovimientoPuntos_tenantId_venceEn_tipo_idx" ON "MovimientoPuntos"("tenantId", "venceEn", "tipo");

ALTER TABLE "ConfigFidelizacion" ADD CONSTRAINT "ConfigFidelizacion_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "PuntosFidelizacion" ADD CONSTRAINT "PuntosFidelizacion_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "PuntosFidelizacion" ADD CONSTRAINT "PuntosFidelizacion_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MovimientoPuntos" ADD CONSTRAINT "MovimientoPuntos_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "MovimientoPuntos" ADD CONSTRAINT "MovimientoPuntos_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MovimientoPuntos" ADD CONSTRAINT "MovimientoPuntos_referenciaFacturaId_fkey" FOREIGN KEY ("referenciaFacturaId") REFERENCES "Factura"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "MovimientoPuntos" ADD CONSTRAINT "MovimientoPuntos_userId_fkey" FOREIGN KEY ("userId") REFERENCES "AppUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;
