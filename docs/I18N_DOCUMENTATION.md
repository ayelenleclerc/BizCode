# Documentation languages policy

BizCode **product and quality documentation** under `docs/` is maintained in **three parallel trees**:

| Locale folder | Language | BCP 47 |
|---------------|----------|--------|
| [`docs/en/`](en/README.md) | English | `en` |
| [`docs/es/`](es/README.md) | Spanish | `es` |
| [`docs/pt-br/`](pt-br/README.md) | Brazilian Portuguese | `pt-BR` |

- **Localized file names** per tree: English uses **kebab-case** names (e.g. `architecture.md`, `theming.md`); Spanish and Portuguese use **localized slugs** (e.g. `arquitectura.md`, `temas-interfaz.md`). The canonical mapping of logical documents to paths is **[DOCUMENT_LOCALE_MAP.md](DOCUMENT_LOCALE_MAP.md)**.
- **Same technical slug across trees** for **ADR** files under `docs/*/adr/` (e.g. `ADR-0001-rest-prisma.md` in each locale).
- **Machine-readable API contract** remains a single file: [`docs/api/openapi.yaml`](api/openapi.yaml) (not translated).
- **Repository root** files such as [`README.md`](../README.md) and [`CONTRIBUTING.md`](../CONTRIBUTING.md) are maintained in **English** as the default for contributors; this policy document is also available in Spanish and Portuguese below.

### Why localized filenames

Using **locale-appropriate paths** makes navigation and search natural in each language while keeping a **single logical document** per row in [DOCUMENT_LOCALE_MAP.md](DOCUMENT_LOCALE_MAP.md). Cross-links between trees must point to the **actual filename** in each locale (see map). The **markdown body** is fully translated.

---

## Política de idiomas de la documentación

La **documentación de producto y calidad** en `docs/` se mantiene en **tres árboles paralelos**: `docs/en/`, `docs/es/`, `docs/pt-br/`.

- **Nombres de archivo localizados** por idioma; el mapa canónico está en **[DOCUMENT_LOCALE_MAP.md](DOCUMENT_LOCALE_MAP.md)**.
- Los **ADR** conservan el **mismo slug técnico** en cada carpeta `adr/`.
- El contrato OpenAPI permanece en un único archivo: `docs/api/openapi.yaml`.

Los archivos en la raíz del repositorio (`README.md`, `CONTRIBUTING.md`) se mantienen en **inglés** por convención de contribución; el índice principal de documentación está en [`docs/README.md`](README.md).

---

## Política de idiomas da documentação

A **documentação de produto e qualidade** em `docs/` é mantida em **três árvores paralelas**: `docs/en/`, `docs/es/`, `docs/pt-br/`.

- **Nomes de arquivo localizados** por idioma; o mapa canônico está em **[DOCUMENT_LOCALE_MAP.md](DOCUMENT_LOCALE_MAP.md)**.
- **ADRs** mantêm o **mesmo slug técnico** em cada pasta `adr/`.
- O contrato OpenAPI permanece em um único arquivo: `docs/api/openapi.yaml`.

Os arquivos na raiz do repositório (`README.md`, `CONTRIBUTING.md`) são mantidos em **inglês** como padrão para contribuidores; o índice principal está em [`docs/README.md`](README.md).
