-- Repair: some local DBs marked cobro_recordatorio applied without this column.
ALTER TABLE "ParamEmpresa" ADD COLUMN IF NOT EXISTS "recordatorioDiasGracia" INTEGER NOT NULL DEFAULT 0;
