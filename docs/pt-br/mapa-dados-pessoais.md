# Mapa de dados pessoais

## Inventário

| Campo | Entidade | Tipo | Finalidade | Base legal | Retenção |
|---|---|---|---|---|---|
| `rsocial` | Cliente | Nome empresarial | Identificação em faturas | Obrigação contratual | Relação comercial + 10 anos (fiscal) |
| `cuit` | Cliente | ID fiscal AR | Faturamento; conformidade ARCA | Obrigação legal (Res. Gral. 1415, ARCA) | 10 anos |
| `email` | Cliente | E-mail | Comunicações (opcional) | Consentimento | Até pedido de exclusão |
| Endereço, telefone | Cliente | Contato | Faturas / contato | Contrato / consentimento | Conforme política |

## Dados não pessoais

Códigos de produto, preços, totais de fatura — dados comerciais da empresa.

## Direitos do titular (Lei 25.326 — Argentina)

Acesso, retificação, exclusão quando não houver obrigação legal de manter os dados.

## Segurança

- PostgreSQL local; sem envio a serviços externos de terceiros.
- Credenciais em `.env` (não versionado).

**Outros idiomas:** [English](../en/mapa-dados-pessoais.md) · [Español](../es/mapa-dados-pessoais.md)
