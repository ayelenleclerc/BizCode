# Guía para asistentes de IA (Cursor / Copilot)

## Cumplimiento obligatorio

**Debes seguir las reglas del proyecto en [`.cursor/rules/bizcode.mdc`](.cursor/rules/bizcode.mdc)** (siempre activas) y, al editar Markdown bajo `docs/`, también [`.cursor/rules/bizcode-documentation.mdc`](.cursor/rules/bizcode-documentation.mdc). Si una instrucción del chat contradice esas reglas, prevalecen las reglas del repositorio.

## Referencias normativas (detalle en `docs/`)

- **Convenciones de código y comentarios trilingües:** [docs/en/coding-standards.md](docs/en/coding-standards.md) · [es](docs/es/estandares-codigo.md) · [pt-BR](docs/pt-br/padroes-codigo.md)
- **Accesibilidad:** [docs/ACCESSIBILITY.md](docs/ACCESSIBILITY.md) (WCAG 2.2 AA como mínimo; ESLint `jsx-a11y` con cero advertencias)
- **i18n:** [docs/en/i18n-strategy.md](docs/en/i18n-strategy.md) · [es](docs/es/estrategia-i18n.md) · [pt-BR](docs/pt-br/estrategia-i18n.md); no introducir literales de usuario en JSX sin `t()`
- **Pruebas y cobertura:** [docs/en/quality/testing-strategy.md](docs/en/quality/testing-strategy.md) — cobertura 100% en el alcance definido (`src/lib/**`, `server/createApp.ts`, `server.ts`); E2E smoke Playwright, integración PostgreSQL (`npm run test:integration`, `tests/integration/`), [ADR-0004](docs/en/adr/ADR-0004-e2e-playwright-integration-roadmap.md), [ADR-0005](docs/en/adr/ADR-0005-vitest-coverage-server-bootstrap.md); [es](docs/es/quality/estrategia-pruebas.md) · [pt-BR](docs/pt-br/quality/estrategia-testes.md)
- **Documentación ISO-ready (paquete de certificación):** [Certificación-ISO/README.md](Certificación-ISO/README.md) · [en](docs/en/certificacion-iso/iso-package-index.md) · [es](docs/es/certificacion-iso/indice-paquete-iso.md) · [pt-BR](docs/pt-br/certificacion-iso/indice-pacote-iso.md); regla [`.cursor/rules/certificacion-iso.mdc`](.cursor/rules/certificacion-iso.mdc)
- **Política de idiomas de documentación:** [docs/I18N_DOCUMENTATION.md](docs/I18N_DOCUMENTATION.md) · mapa canónico [docs/DOCUMENT_LOCALE_MAP.md](docs/DOCUMENT_LOCALE_MAP.md); si cambian rutas documentales, `npm run check:docs-map` debe pasar (véase [docs/en/certificacion-iso/document-lifecycle-and-validation.md](docs/en/certificacion-iso/document-lifecycle-and-validation.md))
- **API / OpenAPI / Swagger:** contrato en [docs/api/openapi.yaml](docs/api/openapi.yaml); **Swagger UI** en `http://localhost:3001/api-docs/` cuando el API está en marcha (`npm run server`); política y plan trilingüe [en](docs/en/quality/swagger-openapi-ui-plan.md) · [es](docs/es/quality/plan-swagger-openapi-ui.md) · [pt-BR](docs/pt-br/quality/plano-swagger-openapi-ui.md); detalle en [`.cursor/rules/bizcode.mdc`](.cursor/rules/bizcode.mdc) (sección «Contrato API»). [ADR-0003](docs/en/adr/ADR-0003-api-contract-testing.md) (contrato de pruebas).
- **Documentación generada (TypeDoc, OpenAPI→MD, esquemas, SBOM):** `npm run docs:generate`; guía [en](docs/en/quality/generated-documentation.md) · [es](docs/es/quality/documentacion-generada.md) · [pt-BR](docs/pt-br/quality/documentacao-gerada.md); reglas [`.cursor/rules/doc-generation.mdc`](.cursor/rules/doc-generation.mdc). **Node ≥ 22** (`package.json` `engines`).

No duplicar reglas largas aquí; enlazar a `docs/` y a `.cursor/rules/` cuando haga falta detalle.
