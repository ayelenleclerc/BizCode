# ADR-0007: Implantação dual (desktop / SaaS) e modularidade fiscal

**Estado:** Aceita  
**Data:** 2026-04-01  
**Referência ISO:** ISO/IEC 12207:2017 §6.3.2 (design de software); ISO 9001:2015 §8.3.3 (saídas de design)

---

## Contexto

O BizCode entrega-se hoje como aplicação **desktop Tauri** com **API Express local** e **PostgreSQL** ([arquitetura.md](../arquitetura.md)). A estratégia de produto visa o **mesmo domínio** para **SaaS hospedado** no futuro e comportamento **fiscal por país** (faturação eletrónica, impostos, integrações com autoridades) sem manter **dois produtos desconectados** nem um **repositório bifurcado permanente**.

Opções consideradas:

1. **Repositório clonado separado** para SaaS — MVP rápido, mas deriva e duplicação a longo prazo.
2. **Monorepo único, núcleo partilhado, módulos fiscais plugáveis e adaptadores de implantação** — mais disciplina inicial, uma fonte da verdade.

## Decisão

1. **Um repositório / monorepo** permanece o padrão; evitar segundo clone permanente «só SaaS» salvo restrição externa forte (documentada num ADR futuro).
2. **Dois modos de entrega** são metas de primeira classe: **desktop** (atual) e **SaaS** (web + API hospedada + BD gerenciada, multi-tenant quando necessário). Partilham **lógica de domínio** e **contrato API** ([OpenAPI](../../api/openapi.yaml)); implantação e isolamento diferem.
3. O comportamento **fiscal** organiza-se em **módulos ou camadas por país/jurisdição**, ativados por **configuração, licença ou tenant** — não duplicado como condicionais ad hoc em ficheiros não relacionados.
4. **Canal (desktop vs nuvem) e jurisdição (p.ex. Argentina vs outros países)** são dimensões **independentes**; priorização comercial não deve acoplar-se tecnicamente sem documentação explícita ([visao-produto-e-implantacao.md](../quality/visao-produto-e-implantacao.md)).
5. **Docker opcional** para API + base é permitido para dev/deploy servidor quando introduzido; **não** substitui builds nativos Tauri (ver documento de visão).

## Consequências

- **Positivo:** Trajetória clara para SaaS; extensões fiscais localizadas; OpenAPI e testes de contrato permanecem âncora de integração.
- **Negativo:** Exige disciplina em PRs (referenciar visão ou este ADR ao alterar implantação ou fiscal); aspetos específicos de SaaS (faturação de assinatura, residência de dados, isolamento multi-tenant) exigem **ADRs adicionais** ao implementar.
- **API:** Qualquer API pública SaaS deve **alinhar-se ou versionar-se explicitamente** face ao contrato OpenAPI; mudanças disruptivas exigem ADR e atualização de testes de contrato conforme [ADR-0003](ADR-0003-api-contract-testing.md).

## Referências

- [visao-produto-e-implantacao.md](../quality/visao-produto-e-implantacao.md) (PROD-VISION-001)
- [arquitetura.md](../arquitetura.md)
- [CONTRIBUTING.md](../../../CONTRIBUTING.md)
