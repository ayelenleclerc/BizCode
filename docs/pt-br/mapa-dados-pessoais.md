# Mapa de dados pessoais

## Inventário

| Campo | Entidade | Tipo | Finalidade | Base legal | Retenção |
|---|---|---|---|---|---|
| `rsocial` | Cliente | Nome empresarial | Identificação em faturas | Obrigação contratual | Relação comercial + 10 anos (fiscal) |
| `cuit` | Cliente | ID fiscal AR | Faturamento; conformidade ARCA | Obrigação legal (Res. Gral. 1415, ARCA) | 10 anos |
| `email` | Cliente | E-mail | Comunicações (opcional) | Consentimento | Até pedido de exclusão |
| Endereço (`domicilio`, etc.) | Cliente | Endereço postal | Faturas; texto de entrega na UI (sem coordenadas em `Cliente`) | Contrato | Conforme política |
| `telef` | Cliente | Telefone | Contato (opcional) | Consentimento | Até pedido de exclusão |
| `receptorNombre`, `receptorDni` | RepartoItem (POD) | Nome do receptor / documento opcional | Comprovante de entrega (`logistics.pod`) | Contrato / interesse legítimo | Conforme reparto / operador |
| `podMedia` (assinatura / foto JSON) | RepartoItem (POD) | Assinatura; foto opcional | Comprovante de entrega | Contrato | Conforme reparto |
| `lat`, `lng`, `recordedAt` | RepartoUbicacion | Amostra de geolocalização do motorista | Rastreamento ao vivo (`logistics.gps`) | Interesse legítimo / operação | **7 dias** (purga na aplicação + `npm run reparto-ubicacion:purge`) |
| `username`, role | AppUser | Conta do motorista / equipe | Autenticação e atribuição | Contrato | Vida da conta |

## Dados não pessoais

Códigos de produto, preços, totais de fatura e metadados operacionais de reparto (estado, sequência) — dados comerciais ou logísticos, não pessoais.

## Terceiros e rede (por módulo)

| Fluxo | Quando | O que sai do ambiente do operador |
|---|---|---|
| **API própria** | Sempre | Sessão e dados entre cliente e servidor BizCode do operador |
| **Geolocation API do navegador** | Motorista com `logistics.gps` e permissão | Coordenadas no dispositivo; POST `{ lat, lng }` apenas para **`/api/repartos/{id}/ubicacion`** (opcional; não bloqueia POD) |
| **Teselas OpenStreetMap** | Planejador em `/logistica/seguimiento` com `logistics.gps` | Navegador baixa teselas (Leaflet + OSM) |
| **AFIP / e-mail** | Com integrações configuradas | Ver [seguranca.md](seguranca.md) |

`logistics.gps` **não** armazena coordenadas de clientes no esquema atual.

## Direitos do titular (Lei 25.326 — Argentina)

- **Acesso:** `GET /api/clientes/:id/exportar-datos` (owner / super_admin) ou contato do operador.
- **Retificação:** `PUT /api/clientes/:id`.
- **Exclusão:** anonimização irreversível `POST /api/clientes/:id/anonimizar` (comprovantes fiscais mantidos).
- **Oposição (marketing):** o BizCode não inclui motor de marketing.

Página pública: `/privacidad`. Detalhe: [privacidade-e-direitos-do-titular.md](quality/privacidade-e-direitos-do-titular.md).

Contato comercial opcional: até **5 anos** ou anonimização. Registros fiscais: **10 anos**.

## Segurança

- PostgreSQL sob controle do operador; credenciais em `.env` (não versionado).
- POD e GPS são dados por tenant; alinhar retenção à política do operador.

## Conformidade

- Mapa e geolocalização só com módulo **`logistics.gps`** e permissão do navegador.
- Sem cookies de publicidade ou rastreamento cross-site na UI do produto.

**Outros idiomas:** [English](../en/privacy-data-map.md) · [Español](../es/mapa-datos-personales.md)
