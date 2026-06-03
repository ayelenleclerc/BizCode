# Matriz RBAC — papéis, permissões e escopos

**Fonte da verdade no código:** [`ROLE_PERMISSIONS`](../../../src/lib/rbac.ts) e constantes relacionadas em [`src/lib/rbac.ts`](../../../src/lib/rbac.ts). **Não** há tabelas separadas `role_permissions` / `user_roles`; o papel do usuário da aplicação fica no enum Prisma em `AppUser` (ver [`prisma/schema.prisma`](../../../prisma/schema.prisma)).

## Papel → permissões

| Papel | Permissões (de `ROLE_PERMISSIONS`) |
|-------|-------------------------------------|
| `super_admin` | Todos os `OWNER_PERMISSIONS` mais `platform.tenants.manage`, `platform.support.impersonate` |
| `owner` | `users.manage`, `roles.assign`, `sales.create`, `sales.cancel`, `customers.read`, `customers.manage`, `products.read`, `products.manage`, `inventory.adjust`, `inventory.count`, `orders.create`, `orders.pick`, `orders.dispatch`, `orders.deliver.confirm`, `reports.operational.read`, `reports.financial.read`, `settings.business.manage`, `settings.fiscal.manage`, `audit.read` |
| `manager` | `sales.create`, `sales.cancel`, `customers.read`, `customers.manage`, `products.read`, `products.manage`, `inventory.adjust`, `inventory.count`, `orders.create`, `orders.pick`, `orders.dispatch`, `reports.operational.read`, `audit.read` |
| `seller` | `sales.create`, `customers.read`, `customers.manage`, `orders.create`, `products.read` |
| `backoffice` | `customers.read`, `customers.manage`, `products.read`, `reports.operational.read` |
| `warehouse_op` | `orders.pick`, `products.read` |
| `warehouse_lead` | `orders.pick`, `orders.dispatch`, `inventory.adjust`, `inventory.count`, `reports.operational.read` |
| `logistics_planner` | `orders.dispatch`, `reports.operational.read` |
| `driver` | `orders.deliver.confirm` |
| `billing` | `sales.create`, `sales.cancel`, `reports.operational.read` |
| `cashier` | `sales.create`, `reports.operational.read` |
| `collections` | `reports.operational.read`, `reports.financial.read` |
| `finance` | `reports.financial.read`, `audit.read` |
| `auditor` | `reports.operational.read`, `reports.financial.read`, `audit.read` |

Os literais completos estão em `PERMISSIONS` no mesmo arquivo.

**Picking (#143):** `GET /api/ordenes-entrega` também aceita `orders.pick` (ex.: `warehouse_op`). `POST .../iniciar-picking` e `POST .../lista` exigem `orders.pick` e módulo `logistics.picking`.

## Canais (`USER_CHANNELS`)

Definidos no código: `counter`, `field`, `backoffice`, `warehouse`, `delivery`. Fazem parte de `AuthScope.channels` e persistem em `AppUser.scopeChannels` (schema Prisma). O enforcement está ativo via `requirePermission` em [`server/auth.ts`](../../../server/auth.ts), validando `x-bizcode-channel` opcional contra o escopo de `AuthClaims`.

## Local vs SaaS

- **Mesmo modelo:** multi-tenant `Tenant`, sessão por cookie, `AuthClaims` com papel e permissões derivadas (ver [modelo-iam-sessoes-auditoria.md](modelo-iam-sessoes-auditoria.md)).
- **Diferenças de implantação** (desktop vs SaaS, módulos fiscais por jurisdição) seguem PROD-VISION-001 e ADR-0007; esta matriz não duplica regras fiscais.

## Varejo vs atacado (enquadramento de negócio)

- Cenários de **varejo** mapeiam para papéis como `seller`, `cashier` e canais `counter`/`field` para ponto de venda e atendimento.
- Cenários **atacado / distribuição** usam `warehouse_op`, `warehouse_lead`, `logistics_planner`, `driver` e canais `delivery`/`warehouse` para separação, despacho e confirmação de entrega.
- Permissões `orders.*` sustentam domínio de **pedidos futuro**; **não** há entidade `pedido` evidenciada no schema Prisma nem nos paths OpenAPI atuais. A faturação atual usa `facturas` e permissões relacionadas (`sales.create`, `reports.operational.read`, etc.).

## Módulos de produto (análise do dashboard #138)

A aba **Início → Análise** chama `GET /api/dashboard/ventas-historico` e exige **`reports.operational.read`** e o módulo do tenant **`analytics.advanced`** (depende de `analytics.dashboard`). Nenhuma permissão literal nova foi adicionada.

## Repartos (#140)

A UI `/logistica/repartos` depende do módulo **`logistics.dispatches`**. API: listagem/detalhe `GET /api/repartos` e `GET /api/repartos/{id}` exigem **`logistics.read`**; criar, iniciar e fechar exigem **`orders.dispatch`**. Papéis típicos: `owner`, `manager`, `logistics_planner`, `warehouse_lead` (ver `ROLE_PERMISSIONS` no código para `logistics.read` do planejador).

## Comprovante de entrega (POD) (#142)

Módulo **`logistics.pod`**. UI motorista `/logistica/repartos/chofer` exige **`orders.deliver.confirm`** (papel `driver` na própria rota). `PUT /api/repartos/{id}/items/{itemId}` usa a mesma permissão; o serviço exige `choferId === actor.userId` para `driver`. `GET /api/repartos/{id}/items/{itemId}/pod` exige **`logistics.read`** e papel ∈ `owner`, `manager`, `logistics_planner` (exclui `driver`).

## KPIs e relatórios logísticos (#145)

Módulo **`logistics.dispatches`**. `GET /api/logistica/kpis`, `reporte-choferes`, `reporte-zonas`: **`logistics.read`**; papéis `owner`, `manager`, `logistics_planner` (aba em `/logistica`; motorista excluído). CSV com `Accept: text/csv`.

## Rastreamento GPS (#144)

Módulo **`logistics.gps`**. UI `/logistica/seguimiento`: **`logistics.read`** e `GPS_VIEW_ROLES` (`owner`, `manager`, `logistics_planner`). `GET /api/repartos/activos` e `GET .../ubicacion/ultima` (planejador; motorista só na própria rota em `ultima`). `POST /api/repartos/{id}/ubicacion`: **`orders.deliver.confirm`**, motorista dono, reparto `on_route`; motorista não lista activos.

## Notas de crédito e anulação de fatura (#146)

Módulo de tenant **`billing.credit_notes`**. `PUT /api/facturas/{id}/void` exige **`sales.cancel`** e o módulo; o motivo no corpo cumpre o mínimo do esquema no servidor (10 caracteres). **`GET /api/notas-credito`** e **`GET /api/notas-credito/{id}`** exigem **`reports.financial.read`** *ou* **`reports.operational.read`**. UI: ação **Cancelar nota fiscal** em **`Faturamento`** (`ListadoFacturas.tsx`) somente com `billing.credit_notes`; **Finanças** lista notas no mesmo módulo (a página continua a exigir `reports.financial.read`). Veja [`ADR-0012`](../adr/ADR-0012-anulacao-fatura-nota-credito.md).

## Livro IVA Vendas — Fase 1 (#147)

Módulo **`finance.ledger`**. **`GET /api/contabilidad/libro-iva-ventas`** exige **`reports.financial.read`**. **`GET /api/contabilidad/libro-iva-compras`** e **`POST /api/comprobantes-compra`** usam o mesmo módulo e permissão (#306). Veja [`ADR-0014`](../adr/ADR-0014-libro-iva-compras.md) e [`ADR-0013`](../adr/ADR-0013-libro-iva-ventas-fase1.md).

## Documentos relacionados

- Índice de execução do plano mestre: [execucao-plano-mestre-bizcode.md](execucao-plano-mestre-bizcode.md)
- Fluxo operacional (desenho): [fluxo-operacional-pedido-entrega-cobranca.md](fluxo-operacional-pedido-entrega-cobranca.md)
