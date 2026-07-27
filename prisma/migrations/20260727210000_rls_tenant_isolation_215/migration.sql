-- Issue #215: PostgreSQL FORCE RLS on AC-minimum tenant tables + fail-safe policies.
-- GUC: app.current_tenant_id (numeric text). Empty / unset → 0 rows (NULLIF → NULL ≠ int).
-- Migrate/seed should use a role with BYPASSRLS or superuser; runtime app role must NOT bypass.
-- Optional non-bypass role for local/CI checks (SET ROLE bizcode_app):

DO $$
BEGIN
  CREATE ROLE bizcode_app NOSUPERUSER NOBYPASSRLS NOCREATEDB NOCREATEROLE INHERIT LOGIN;
EXCEPTION
  WHEN duplicate_object THEN
    NULL;
END
$$;

GRANT USAGE ON SCHEMA public TO bizcode_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE
  "Factura",
  "Cliente",
  "Proveedor",
  "Articulo",
  "Pedido",
  "OrdenCompra",
  "StockAjuste",
  "Notification",
  "AuditEvent"
TO bizcode_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO bizcode_app;

-- Factura
ALTER TABLE "Factura" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Factura" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_factura ON "Factura";
CREATE POLICY tenant_isolation_factura ON "Factura"
  FOR ALL
  USING ("tenantId" = NULLIF(current_setting('app.current_tenant_id', true), '')::int)
  WITH CHECK ("tenantId" = NULLIF(current_setting('app.current_tenant_id', true), '')::int);

-- Cliente
ALTER TABLE "Cliente" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Cliente" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_cliente ON "Cliente";
CREATE POLICY tenant_isolation_cliente ON "Cliente"
  FOR ALL
  USING ("tenantId" = NULLIF(current_setting('app.current_tenant_id', true), '')::int)
  WITH CHECK ("tenantId" = NULLIF(current_setting('app.current_tenant_id', true), '')::int);

-- Proveedor
ALTER TABLE "Proveedor" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Proveedor" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_proveedor ON "Proveedor";
CREATE POLICY tenant_isolation_proveedor ON "Proveedor"
  FOR ALL
  USING ("tenantId" = NULLIF(current_setting('app.current_tenant_id', true), '')::int)
  WITH CHECK ("tenantId" = NULLIF(current_setting('app.current_tenant_id', true), '')::int);

-- Articulo
ALTER TABLE "Articulo" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Articulo" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_articulo ON "Articulo";
CREATE POLICY tenant_isolation_articulo ON "Articulo"
  FOR ALL
  USING ("tenantId" = NULLIF(current_setting('app.current_tenant_id', true), '')::int)
  WITH CHECK ("tenantId" = NULLIF(current_setting('app.current_tenant_id', true), '')::int);

-- Pedido
ALTER TABLE "Pedido" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Pedido" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_pedido ON "Pedido";
CREATE POLICY tenant_isolation_pedido ON "Pedido"
  FOR ALL
  USING ("tenantId" = NULLIF(current_setting('app.current_tenant_id', true), '')::int)
  WITH CHECK ("tenantId" = NULLIF(current_setting('app.current_tenant_id', true), '')::int);

-- OrdenCompra
ALTER TABLE "OrdenCompra" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "OrdenCompra" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_orden_compra ON "OrdenCompra";
CREATE POLICY tenant_isolation_orden_compra ON "OrdenCompra"
  FOR ALL
  USING ("tenantId" = NULLIF(current_setting('app.current_tenant_id', true), '')::int)
  WITH CHECK ("tenantId" = NULLIF(current_setting('app.current_tenant_id', true), '')::int);

-- StockAjuste
ALTER TABLE "StockAjuste" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "StockAjuste" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_stock_ajuste ON "StockAjuste";
CREATE POLICY tenant_isolation_stock_ajuste ON "StockAjuste"
  FOR ALL
  USING ("tenantId" = NULLIF(current_setting('app.current_tenant_id', true), '')::int)
  WITH CHECK ("tenantId" = NULLIF(current_setting('app.current_tenant_id', true), '')::int);

-- Notification
ALTER TABLE "Notification" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Notification" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_notification ON "Notification";
CREATE POLICY tenant_isolation_notification ON "Notification"
  FOR ALL
  USING ("tenantId" = NULLIF(current_setting('app.current_tenant_id', true), '')::int)
  WITH CHECK ("tenantId" = NULLIF(current_setting('app.current_tenant_id', true), '')::int);

-- AuditEvent (issue wording: AuditLog)
ALTER TABLE "AuditEvent" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AuditEvent" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_audit_event ON "AuditEvent";
CREATE POLICY tenant_isolation_audit_event ON "AuditEvent"
  FOR ALL
  USING ("tenantId" = NULLIF(current_setting('app.current_tenant_id', true), '')::int)
  WITH CHECK ("tenantId" = NULLIF(current_setting('app.current_tenant_id', true), '')::int);
