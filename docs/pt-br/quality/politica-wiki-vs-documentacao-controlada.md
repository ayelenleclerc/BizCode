# Política Wiki vs documentação controlada

## Finalidade

Definir qual conteúdo pode ficar no GitHub Wiki e qual conteúdo deve permanecer na documentação controlada do repositório para auditoria e governança de releases.

## Decisão

- GitHub Wiki é permitido para guias operacionais e conteúdo de mudança rápida.
- A documentação do repositório é obrigatória para artefatos controlados, auditáveis e sujeitos a gates de qualidade.

## Conteúdo controlado no repositório (obrigatório em `docs/` ou `Certificación-ISO/`)

- Documentação de qualidade, processos e conformidade.
- Evidências ISO, procedimentos e registros de rastreabilidade.
- Comportamento do produto, contrato de API e decisões de arquitetura.
- Qualquer documento exigido por checks de CI ou critérios de release.

## Conteúdo permitido no Wiki (apenas suporte)

- Runbooks operacionais e notas de troubleshooting.
- FAQs internas e guias rápidos.
- Notas temporárias de investigação antes de formalização em documentação controlada.

## Aplicação automática

- O workflow de CI `Docs governance guard` valida PRs que alteram documentação controlada.
- Se documentação controlada localizada mudar em um idioma, exige cobertura EN/ES/PT-BR no mesmo PR.
- OpenAPI permanece como fonte única em `docs/api/openapi.yaml` (contrato não traduzido).
