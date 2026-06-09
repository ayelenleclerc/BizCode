-- ParamEmpresa fiscal header fields for legal invoice PDF (#148)
ALTER TABLE "ParamEmpresa" ADD COLUMN "condicionIva" VARCHAR(10) NOT NULL DEFAULT 'RI';
ALTER TABLE "ParamEmpresa" ADD COLUMN "ingresosBrutos" VARCHAR(30);
ALTER TABLE "ParamEmpresa" ADD COLUMN "fechaInicioActividades" DATE;
