# ADR-0022: Ativação de módulos legais por jurisdição fiscal

**Status:** Aceito  
**Data:** 2026-08-31  
**Referência ISO:** ISO/IEC 12207:2017 §6.3.2 (design de software)

---

## Contexto

A issue [#207](https://github.com/ayelenleclerc/BizCode/issues/207) adicionou jurisdição fiscal por tenant (`TenantConfig.jurisdiccionFiscal`), que governa IVA, validação de identificador fiscal e seleção de adapter. O provisionamento, porém, continuava argentino por construção:

- Os quatro módulos legais argentinos (`billing.arca_cae`, `finance.retenciones`, `fiscal.remito`, `fiscal.cheques`) fazem parte de `DEFAULT_MODULES`, então todo tenant novo os recebia independentemente da jurisdição.
- Nenhum caminho de alta escrevia `jurisdiccionFiscal`; todos dependiam do default `'AR'` da coluna.
- O registro SaaS público validava CUIT e consultava o padrón ARCA sem condicionar por país.
- O catálogo só sabia onde um módulo era **obrigatório** (`requiredInProdForCountries`), nunca onde era **aplicável**.

A evidência de que esses quatro módulos são argentinos está no código: `remitoPdf.ts` e as exportações SICORE/SIFERE vivem em `apps/server/fiscal/ar/`, `billing.arca_cae` aponta para ARCA, e o modelo `Cheque` persiste `cbuOrigen`, `libradorCuit` e a modalidade `echeq`.

A issue [#437](https://github.com/ayelenleclerc/BizCode/issues/437) generaliza isso antes de somar mais países, para que cada jurisdição nova seja declarativa e não um novo conjunto de condicionais.

Opções consideradas:

1. Adicionar condicionais por país onde cada módulo argentino é usado — espalha lógica fiscal em arquivos não relacionados, o que [ADR-0007](ADR-0007-dual-deployment-and-fiscal-modularity.md) ponto 3 rejeita.
2. Inferir aplicabilidade a partir de `requiredInProdForCountries` — mistura «obrigatório em produção» com «legalmente aplicável».
3. **Declarar aplicabilidade no catálogo e resolver a jurisdição da instalação a partir do ambiente do servidor** — escolhida.

## Decisão

1. `ModuleDef.availableForCountries?: readonly string[]` declara onde um módulo é legalmente aplicável. **Ausente significa aplicável em toda parte**; apenas os quatro argentinos são restritos a `['AR']`.
2. O conjunto inicial de módulos deriva da jurisdição via `getDefaultModulesForJurisdiction`.
3. `validateModuleSet` rejeita módulo não aplicável com `not_available_in_country:<code>`; catálogo e presets omitem esses módulos.
4. A instalação declara jurisdições com `BIZCODE_FISCAL_JURISDICTIONS` e `BIZCODE_DEFAULT_JURISDICTION` (só ambiente de servidor), lidas por `resolveInstallationJurisdictions`. Sem definir: comportamento pré-#437 (todas habilitadas, default `AR`).
5. Todo caminho de alta escreve `jurisdiccionFiscal` via `buildNewTenantFiscalDefaults`.
6. `upsertConfig` rejeita jurisdição fora da lista com `jurisdiction_not_enabled`.
7. O registro público escolhe o país entre os habilitados, valida o tax id com `validateTaxId`, e a consulta ARCA só roda para `AR`.

## Consequências

- **Positivo:** Adicionar um país é declarativo.
- **Positivo:** Instalação single-country deixa de oferecer as demais.
- **Positivo:** Sem migração de dados.
- **Negativo:** Provisionamento depende de env vars do servidor; mitigado por fallback.
- **Não evidenciado:** Licenciamento por jurisdição (ADR-0007 menciona licença como eixo; só há configuração), e integração **live** com organismos estrangeiros (DGI, SII, SAT, SEFAZ/NF-e). Inventário: adaptadores UY/CL/MX/BR são **mocks** com `implemented: true` no registro de provedores fiscais (`uruguay_dgi`, `chile_sii`, `mexico_sat_pac`, `brazil_sefaz_nfe`); SOAP/REST/PAC/SEFAZ + certificado live permanece Not evidenced.

## Referências

- Issue #437, Issue #207
- [ADR-0007](ADR-0007-dual-deployment-and-fiscal-modularity.md)
- [ativacao-modulos-legais-por-jurisdicao.md](../quality/ativacao-modulos-legais-por-jurisdicao.md)
