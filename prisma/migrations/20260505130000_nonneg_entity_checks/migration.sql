-- Issue #79: CHECK constraints aligned with Zod / API (non-negative stock, minimo, creditLimit).

ALTER TABLE "Articulo" ADD CONSTRAINT "Articulo_stock_nonneg_check" CHECK (stock >= 0);
ALTER TABLE "Articulo" ADD CONSTRAINT "Articulo_minimo_nonneg_check" CHECK (minimo >= 0);

ALTER TABLE "Cliente" ADD CONSTRAINT "Cliente_creditLimit_nonneg_check" CHECK ("creditLimit" IS NULL OR "creditLimit" >= 0);
