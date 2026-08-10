-- #267 seller daily routes: VendedorZona, Feriado, RutaVendedor, RutaParada, Cliente lat/lng

ALTER TABLE "Cliente" ADD COLUMN IF NOT EXISTS "latitud" DECIMAL(10,7);
ALTER TABLE "Cliente" ADD COLUMN IF NOT EXISTS "longitud" DECIMAL(10,7);

CREATE TABLE IF NOT EXISTS "VendedorZona" (
    "id" SERIAL NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "vendedorId" INTEGER NOT NULL,
    "deliveryZoneId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "VendedorZona_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "VendedorZona_tenantId_vendedorId_deliveryZoneId_key"
  ON "VendedorZona"("tenantId", "vendedorId", "deliveryZoneId");
CREATE INDEX IF NOT EXISTS "VendedorZona_tenantId_vendedorId_idx" ON "VendedorZona"("tenantId", "vendedorId");

CREATE TABLE IF NOT EXISTS "Feriado" (
    "id" SERIAL NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "fecha" DATE NOT NULL,
    "nombre" VARCHAR(120) NOT NULL,
    "tipo" VARCHAR(20) NOT NULL DEFAULT 'nacional',
    "provincia" VARCHAR(60),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Feriado_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "Feriado_tenantId_fecha_nombre_key" ON "Feriado"("tenantId", "fecha", "nombre");
CREATE INDEX IF NOT EXISTS "Feriado_tenantId_fecha_idx" ON "Feriado"("tenantId", "fecha");

CREATE TABLE IF NOT EXISTS "RutaVendedor" (
    "id" SERIAL NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "vendedorId" INTEGER NOT NULL,
    "fecha" DATE NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RutaVendedor_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "RutaVendedor_tenantId_vendedorId_fecha_key"
  ON "RutaVendedor"("tenantId", "vendedorId", "fecha");
CREATE INDEX IF NOT EXISTS "RutaVendedor_tenantId_fecha_idx" ON "RutaVendedor"("tenantId", "fecha");

CREATE TABLE IF NOT EXISTS "RutaParada" (
    "id" SERIAL NOT NULL,
    "rutaId" INTEGER NOT NULL,
    "clienteId" INTEGER NOT NULL,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "estado" VARCHAR(20) NOT NULL DEFAULT 'pendiente',
    "motivo" VARCHAR(200),
    "visitaId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RutaParada_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "RutaParada_rutaId_orden_idx" ON "RutaParada"("rutaId", "orden");
CREATE INDEX IF NOT EXISTS "RutaParada_clienteId_idx" ON "RutaParada"("clienteId");
CREATE INDEX IF NOT EXISTS "RutaParada_visitaId_idx" ON "RutaParada"("visitaId");

DO $$ BEGIN
  ALTER TABLE "VendedorZona" ADD CONSTRAINT "VendedorZona_tenantId_fkey"
    FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "VendedorZona" ADD CONSTRAINT "VendedorZona_vendedorId_fkey"
    FOREIGN KEY ("vendedorId") REFERENCES "AppUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "VendedorZona" ADD CONSTRAINT "VendedorZona_deliveryZoneId_fkey"
    FOREIGN KEY ("deliveryZoneId") REFERENCES "DeliveryZone"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "Feriado" ADD CONSTRAINT "Feriado_tenantId_fkey"
    FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "RutaVendedor" ADD CONSTRAINT "RutaVendedor_tenantId_fkey"
    FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "RutaVendedor" ADD CONSTRAINT "RutaVendedor_vendedorId_fkey"
    FOREIGN KEY ("vendedorId") REFERENCES "AppUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "RutaParada" ADD CONSTRAINT "RutaParada_rutaId_fkey"
    FOREIGN KEY ("rutaId") REFERENCES "RutaVendedor"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "RutaParada" ADD CONSTRAINT "RutaParada_clienteId_fkey"
    FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "RutaParada" ADD CONSTRAINT "RutaParada_visitaId_fkey"
    FOREIGN KEY ("visitaId") REFERENCES "VisitaVendedor"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
