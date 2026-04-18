-- Align DB with API validation: condIva accepts RI, Mono, CF, Exento (see server/createApp validateClienteInput).
ALTER TABLE "Cliente" ALTER COLUMN "condIva" SET DATA TYPE VARCHAR(10);
