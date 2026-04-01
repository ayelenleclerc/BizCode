# Visão de produto: desktop, SaaS e modularidade fiscal

**ID de evidência:** PROD-VISION-001  
**ADR relacionado:** [ADR-0007](../adr/ADR-0007-dual-deployment-and-fiscal-modularity.md)

## Finalidade

Este documento registra a **direção estratégica de produto e arquitetura** para alinhar colaboradores e automação (p. ex. agentes Cursor) em **um núcleo de produto** entregue como **desktop** e, quando implementado, **SaaS**, com **regras fiscais isoladas por país ou jurisdição**. **Não** substitui assessoria jurídica ou fiscal por mercado.

## Dois modos de entrega, um núcleo

- **Desktop (atual):** Tauri, SPA React, API Express em sidecar, PostgreSQL — ver [arquitetura.md](../arquitetura.md).
- **SaaS (capacidade alvo):** Mesmo domínio de negócio como **cliente web + API hospedada + base gerenciada** (multi-tenant se necessário).
- **Intenção:** Evitar duas bases de código divergentes. Compartilhar **lógica de domínio**, **modelo de dados** quando factível e **contrato API** ([OpenAPI](../../api/openapi.yaml)); variar **como a stack executa** (binário local vs nuvem) com adaptadores e configuração.

**Canal vs jurisdição:** «Desktop vs nuvem» e «Argentina vs outros países» são **dimensões independentes**. Prioridades comerciais válidas não devem ser codificadas como «só X pode usar Y» sem decisão explícita aqui ou em ADR.

## Desktop multiusuário

Implantações desktop podem ter **vários usuários** (p. ex. escritório/LAN). Usuário, papel e auditoria devem ser **conceptualmente compatíveis** com um futuro SaaS (mesmas entidades; isolamento e política de implantação distintos).

## Módulos fiscais por país

- **Variação regulatória** (faturação eletrônica, impostos, ligações a autoridades) é modelada como **módulos ou camadas por país/jurisdição**, habilitados por **configuração, licença ou tenant** — não como `if (país)` espalhados.
- O mesmo produto pode oferecer opções fiscais **domésticas e internacionais** em **desktop e SaaS**; o que muda é **quais módulos estão ativos**, não necessariamente um fork do repositório.

**Fora do escopo dos «módulos fiscais» sozinhos:** desenho multi-tenant, **cobrança de assinatura do seu SaaS**, residência de dados e obrigações legais por mercado. Exigem desenho, documentação e ADRs separados quando implementados.

## Princípios de arquitetura

| Princípio | Prática |
|-----------|---------|
| **Monorepo** | Preferir **um repositório**; evitar segundo repo «clonado» permanente salvo razão forte. |
| **Núcleo + adaptadores** | Domínio e API estáveis; conectores fiscais e implantação **plugáveis**. |
| **Fronteira API clara** | OpenAPI + testes de contrato como âncora; SaaS deve **respeitar ou versionar** o contrato público. |
| **Entrega em fases** | Fechar desktop com limites claros; adicionar hospedagem sem reescrever do zero. |

## Contêineres opcionais

**Dockerfile** / **docker-compose** para **API + PostgreSQL** (e opcionalmente build web estático) podem ajudar **dev e deploy server-side**. **Não** substituem builds nativos **Tauri** para desktop. Ao introduzir, documentar em qualidade/ops junto a [ciclo-ci-cd.md](ciclo-ci-cd.md).

## Governança: manter o foco

- **PRs** que alterem domínio fiscal ou premissas de implantação devem **referenciar** este documento ou [ADR-0007](../adr/ADR-0007-dual-deployment-and-fiscal-modularity.md) quando a decisão mudar.
- **Git / GitHub:** Fluxo de ramos em [CONTRIBUTING.md](../../../CONTRIBUTING.md); remoto recomendado para backup e revisão.
- **Detalhe legal/fiscal:** Decisões de desenho aqui; **detalhe normativo por país** em matrizes ou anexos em `docs/*/certificacion-iso/` quando couber.
- **Operação SaaS:** Com deploy em nuvem real, ligar [seguranca.md](../seguranca.md) e [mapa-dados-pessoais.md](../mapa-dados-pessoais.md) a runbooks.

## Referências

- [arquitetura.md](../arquitetura.md)
- [CONTRIBUTING.md](../../../CONTRIBUTING.md)
- [I18N_DOCUMENTATION.md](../../I18N_DOCUMENTATION.md) · [DOCUMENT_LOCALE_MAP.md](../../DOCUMENT_LOCALE_MAP.md)
