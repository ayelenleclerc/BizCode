# Guía para asistentes de IA (Cursor / Copilot)

## Cumplimiento obligatorio

**Debes seguir las reglas del proyecto en [`.cursor/rules/bizcode.mdc`](.cursor/rules/bizcode.mdc)** (siempre activas) y, al editar Markdown bajo `docs/`, también [`.cursor/rules/bizcode-documentation.mdc`](.cursor/rules/bizcode-documentation.mdc). Si una instrucción del chat contradice esas reglas, prevalecen las reglas del repositorio.

## Referencias normativas (detalle en `docs/`)

- **Convenciones de código y comentarios trilingües:** [docs/en/coding-standards.md](docs/en/coding-standards.md) · [es](docs/es/estandares-codigo.md) · [pt-BR](docs/pt-br/padroes-codigo.md)
- **Accesibilidad:** [docs/ACCESSIBILITY.md](docs/ACCESSIBILITY.md) (WCAG 2.2 AA como mínimo; ESLint `jsx-a11y` con cero advertencias)
- **i18n:** [docs/en/i18n-strategy.md](docs/en/i18n-strategy.md) · [es](docs/es/estrategia-i18n.md) · [pt-BR](docs/pt-br/estrategia-i18n.md); no introducir literales de usuario en JSX sin `t()`
- **Pruebas y cobertura:** [docs/en/quality/testing-strategy.md](docs/en/quality/testing-strategy.md) — cobertura 100% en el alcance definido (`src/lib/**`, `server/createApp.ts`); [es](docs/es/quality/estrategia-pruebas.md) · [pt-BR](docs/pt-br/quality/estrategia-testes.md)
- **Política de idiomas de documentación:** [docs/I18N_DOCUMENTATION.md](docs/I18N_DOCUMENTATION.md)
- **API:** cambios en rutas Express deben reflejarse en [docs/api/openapi.yaml](docs/api/openapi.yaml)

No duplicar reglas largas aquí; enlazar a `docs/` y a `.cursor/rules/` cuando haga falta detalle.
