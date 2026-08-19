-- #163 App Driver delivery returns (DevolucionEntrega); stock/NC only on remittance

CREATE TABLE IF NOT EXISTS "DevolucionEntrega" (
    "id" SERIAL NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "repartoId" INTEGER NOT NULL,
    "repartoItemId" INTEGER NOT NULL,
    "motivo" VARCHAR(30) NOT NULL,
    "motivoDetalle" VARCHAR(500),
    "fotoBase64" TEXT,
    "estado" VARCHAR(20) NOT NULL DEFAULT 'registered',
    "registeredById" INTEGER NOT NULL,
    "remittedAt" TIMESTAMP(3),
    "remittedById" INTEGER,
    "notaCreditoId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DevolucionEntrega_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "DevolucionEntrega_repartoItemId_key" ON "DevolucionEntrega"("repartoItemId");
CREATE INDEX IF NOT EXISTS "DevolucionEntrega_tenantId_repartoId_estado_idx" ON "DevolucionEntrega"("tenantId", "repartoId", "estado");
CREATE INDEX IF NOT EXISTS "DevolucionEntrega_tenantId_registeredById_idx" ON "DevolucionEntrega"("tenantId", "registeredById");

CREATE TABLE IF NOT EXISTS "DevolucionEntregaLinea" (
    "id" SERIAL NOT NULL,
    "devolucionEntregaId" INTEGER NOT NULL,
    "articuloId" INTEGER NOT NULL,
    "facturaItemId" INTEGER,
    "cantidad" DECIMAL(14,4) NOT NULL,
    CONSTRAINT "DevolucionEntregaLinea_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "DevolucionEntregaLinea_devolucionEntregaId_idx" ON "DevolucionEntregaLinea"("devolucionEntregaId");
CREATE INDEX IF NOT EXISTS "DevolucionEntregaLinea_articuloId_idx" ON "DevolucionEntregaLinea"("articuloId");

DO $$ BEGIN
  ALTER TABLE "DevolucionEntrega" ADD CONSTRAINT "DevolucionEntrega_tenantId_fkey"
    FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "DevolucionEntrega" ADD CONSTRAINT "DevolucionEntrega_repartoId_fkey"
    FOREIGN KEY ("repartoId") REFERENCES "Reparto"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "DevolucionEntrega" ADD CONSTRAINT "DevolucionEntrega_repartoItemId_fkey"
    FOREIGN KEY ("repartoItemId") REFERENCES "RepartoItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "DevolucionEntrega" ADD CONSTRAINT "DevolucionEntrega_registeredById_fkey"
    FOREIGN KEY ("registeredById") REFERENCES "AppUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "DevolucionEntrega" ADD CONSTRAINT "DevolucionEntrega_remittedById_fkey"
    FOREIGN KEY ("remittedById") REFERENCES "AppUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "DevolucionEntrega" ADD CONSTRAINT "DevolucionEntrega_notaCreditoId_fkey"
    FOREIGN KEY ("notaCreditoId") REFERENCES "NotaCredito"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "DevolucionEntregaLinea" ADD CONSTRAINT "DevolucionEntregaLinea_devolucionEntregaId_fkey"
    FOREIGN KEY ("devolucionEntregaId") REFERENCES "DevolucionEntrega"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "DevolucionEntregaLinea" ADD CONSTRAINT "DevolucionEntregaLinea_articuloId_fkey"
    FOREIGN KEY ("articuloId") REFERENCES "Articulo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "DevolucionEntregaLinea" ADD CONSTRAINT "DevolucionEntregaLinea_facturaItemId_fkey"
    FOREIGN KEY ("facturaItemId") REFERENCES "FacturaItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
