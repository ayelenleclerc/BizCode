# ADR-0008: RBAC para fornecedores (Proveedor)

**Estado:** Aceita  
**Data:** 2026-04-17  
**Referência ISO:** ISO/IEC 27001:2022 A.5.15 (controle de acesso); ISO 9001:2015 §8.5.1 (operações controladas)

---

## Contexto

O produto passou a ter o cadastro **Proveedor** com lista/detalhe, CRUD e importação CSV. Era possível reutilizar **`products.manage`** (como artigos/rubros) ou criar permissões **específicas de fornecedores** para menor privilégio (ex.: compras vs catálogo).

## Decisão

1. **`suppliers.read`** para `GET /api/proveedores` e `GET /api/proveedores/:id`.
2. **`suppliers.manage`** para criar/atualizar e **importação CSV** (`/api/proveedores/import/*`).
3. **Não** reutilizar **`products.manage`** para escrita ou import de fornecedores, para que perfil só de catálogo não gerencie fornecedores implicitamente.

A matriz por papel está em [`src/lib/rbac.ts`](../../../../src/lib/rbac.ts).

## Consequências

- **Positivo:** Separação entre catálogo de produtos e cadastro de fornecedores; import e CRUD ficam sob uma permissão de gestão.
- **Negativo:** Mais permissões para atribuir; quem precisar das duas funções deve receber `products.*` e `suppliers.*` conforme o caso.
- **API:** OpenAPI e rotas `/api/proveedores` devem permanecer alinhadas; testes de contrato cobrem os envelopes.

## Referências

- [`src/lib/rbac.ts`](../../../../src/lib/rbac.ts)
- [`docs/api/openapi.yaml`](../../api/openapi.yaml) (caminhos `proveedores`)
