# Privacidade e direitos do titular (#195)

## Propósito

Descreve como o BizCode apoia direitos do titular (Lei 25.326 / alinhamento GDPR) sobre dados pessoais de **clientes** em `Cliente`. Complementa o [mapa de dados pessoais](../mapa-dados-pessoais.md) e ISO [PRV-001](../certificacion-iso/prv/prv-001-politica-privacidade.md).

**Estado de evidência:** Implementado no produto (exportar, anonimizar, `/privacidad` pública, consent UI na criação). O registro AAIP permanece tarefa **administrativa do operador**. Não é afirmação de certificação.

## Evidência de produto

| Capacidade | Evidência |
|------------|-----------|
| Acesso / exportação | `GET /api/clientes/:id/exportar-datos` (`?format=json\|csv`) — `owner` ou `super_admin` + `customers.manage` + ownership |
| Retificação | `PUT /api/clientes/:id` existente |
| Supressão (anonimização) | `POST /api/clientes/:id/anonimizar` com `{ "confirm": "ANONYMIZE" }`; `Cliente.anonymizedAt`; revoga sessões portal; mantém linhas fiscais |
| Página pública | `/privacidad` (sem autenticação) |
| Consentimento na criação | Checkbox UI (não persistido); onboarding SaaS diferido a #180 |
| Serviço | [`ClientePrivacyService.ts`](../../../apps/server/services/ClientePrivacyService.ts) |

## Retenção (política documentada)

| Categoria | Política |
|-----------|----------|
| Documentos fiscais | **10 anos** |
| Contato comercial opcional | Até solicitação / anonimização (**~5 anos** comercial) |
| GPS motorista | **7 dias** |

## Registro AAIP (operador)

Procedimento perante a AAIP a cargo do operador. **Não inventar** número de inscrição neste repositório.

## Fora de escopo

- Consent onboarding SaaS (#180)
- Centro de preferências de marketing
- Ambientes staging/prod (#152)

## Relacionado

- [Mapa de dados pessoais](../mapa-dados-pessoais.md)
- [PRV-001](../certificacion-iso/prv/prv-001-politica-privacidade.md)
