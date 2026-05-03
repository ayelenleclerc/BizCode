# Matriz RBAC — papéis, permissões e escopos

**Fonte da verdade no código:** [`ROLE_PERMISSIONS`](../../../src/lib/rbac.ts) e constantes relacionadas em [`src/lib/rbac.ts`](../../../src/lib/rbac.ts). **Não** há tabelas separadas `role_permissions` / `user_roles`; o papel do usuário da aplicação fica no enum Prisma em `AppUser` (ver [`prisma/schema.prisma`](../../../prisma/schema.prisma)).

## Papel → permissões

| Papel | Permissões (de `ROLE_PERMISSIONS`) |
|-------|-------------------------------------|
| `super_admin` | Todos os `OWNER_PERMISSIONS` mais `platform.tenants.manage`, `platform.support.impersonate` |
| `owner` | `users.manage`, `roles.assign`, `sales.create`, `sales.cancel`, `customers.read`, `customers.manage`, `products.read`, `products.manage`, `inventory.adjust`, `orders.create`, `orders.pick`, `orders.dispatch`, `orders.deliver.confirm`, `reports.operational.read`, `reports.financial.read`, `settings.business.manage`, `settings.fiscal.manage`, `audit.read` |
| `manager` | `sales.create`, `sales.cancel`, `customers.read`, `customers.manage`, `products.read`, `products.manage`, `inventory.adjust`, `orders.create`, `orders.pick`, `orders.dispatch`, `reports.operational.read`, `audit.read` |
| `seller` | `sales.create`, `customers.read`, `customers.manage`, `orders.create`, `products.read` |
| `backoffice` | `customers.read`, `customers.manage`, `products.read`, `reports.operational.read` |
| `warehouse_op` | `orders.pick`, `products.read` |
| `warehouse_lead` | `orders.pick`, `orders.dispatch`, `inventory.adjust`, `reports.operational.read` |
| `logistics_planner` | `orders.dispatch`, `reports.operational.read` |
| `driver` | `orders.deliver.confirm` |
| `billing` | `sales.create`, `sales.cancel`, `reports.operational.read` |
| `cashier` | `sales.create`, `reports.operational.read` |
| `collections` | `reports.operational.read`, `reports.financial.read` |
| `finance` | `reports.financial.read`, `audit.read` |
| `auditor` | `reports.operational.read`, `reports.financial.read`, `audit.read` |

Os literais completos estão em `PERMISSIONS` no mesmo arquivo.

## Canais (`USER_CHANNELS`)

Definidos no código: `counter`, `field`, `backoffice`, `warehouse`, `delivery`. Fazem parte de `AuthScope.channels` e persistem em `AppUser.scopeChannels` (schema Prisma). O **enforcement** do “canal atual” em cada requisição HTTP **não está evidenciado** em `server/auth.ts` ou `server/createApp.ts` na data deste texto; o escopo é carregado em `AuthClaims` para uso futuro.

## Local vs SaaS

- **Mesmo modelo:** multi-tenant `Tenant`, sessão por cookie, `AuthClaims` com papel e permissões derivadas (ver [modelo-iam-sessoes-auditoria.md](modelo-iam-sessoes-auditoria.md)).
- **Diferenças de implantação** (desktop vs SaaS, módulos fiscais por jurisdição) seguem PROD-VISION-001 e ADR-0007; esta matriz não duplica regras fiscais.

## Varejo vs atacado (enquadramento de negócio)

- Cenários de **varejo** mapeiam para papéis como `seller`, `cashier` e canais `counter`/`field` para ponto de venda e atendimento.
- Cenários **atacado / distribuição** usam `warehouse_op`, `warehouse_lead`, `logistics_planner`, `driver` e canais `delivery`/`warehouse` para separação, despacho e confirmação de entrega.
- Permissões `orders.*` sustentam domínio de **pedidos futuro**; **não** há entidade `pedido` evidenciada no schema Prisma nem nos paths OpenAPI atuais. A faturação atual usa `facturas` e permissões relacionadas (`sales.create`, `reports.operational.read`, etc.).

## Documentos relacionados

- Índice de execução do plano mestre: [execucao-plano-mestre-bizcode.md](execucao-plano-mestre-bizcode.md)
- Fluxo operacional (desenho): [fluxo-operacional-pedido-entrega-cobranca.md](fluxo-operacional-pedido-entrega-cobranca.md)
