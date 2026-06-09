# ADR-0008: RBAC para proveedores (Proveedor)

**Estado:** Aceptada  
**Fecha:** 2026-04-17  
**Referencia ISO:** ISO/IEC 27001:2022 A.5.15 (control de acceso); ISO 9001:2015 §8.5.1 (operaciones controladas)

---

## Contexto

El producto incorporó el maestro **Proveedor** con listado/detalle, CRUD e importación CSV. Las opciones eran reutilizar **`products.manage`** (como artículos/rubros) para minimizar superficie de RBAC, o definir permisos **propios de proveedores** para un menor privilegio (p. ej. compras vs catálogo).

## Decisión

1. **`suppliers.read`** para `GET /api/proveedores` y `GET /api/proveedores/:id`.
2. **`suppliers.manage`** para altas/modificaciones e **importación CSV** (`/api/proveedores/import/*`).
3. **No** reutilizar **`products.manage`** para escrituras ni import de proveedores, de modo que un rol solo de catálogo no mantenga proveedores por omisión.

La asignación por rol está en [`src/lib/rbac.ts`](../../../../src/lib/rbac.ts).

## Consecuencias

- **Positivo:** Separación clara entre catálogo de productos y maestro de proveedores; import y CRUD quedan bajo un mismo permiso de gestión.
- **Negativo:** Más permisos que asignar; quien necesite ambas capacidades debe tener `products.*` y `suppliers.*` según el caso.
- **API:** OpenAPI y rutas `/api/proveedores` deben mantenerse alineadas; las pruebas de contrato validan los envelopes.

## Referencias

- [`src/lib/rbac.ts`](../../../../src/lib/rbac.ts)
- [`docs/api/openapi.yaml`](../../api/openapi.yaml) (rutas `proveedores`)
