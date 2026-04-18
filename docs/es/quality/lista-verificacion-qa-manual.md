# Lista de verificación QA manual

Para releases, regresiones o evidencia de auditoría cuando la automatización no cubre un escenario (p. ej. shell Tauri escritorio).

**Relacionado:** [estrategia-pruebas.md](estrategia-pruebas.md) · [paridad-entornos-pruebas.md](paridad-entornos-pruebas.md)

---

## Criterios de entrada

- [ ] Node.js 22 LTS (`package.json` `engines`)
- [ ] `DATABASE_URL` válida; migraciones aplicadas (`npx prisma migrate deploy`)
- [ ] Seed o bootstrap si hace falta login (`BIZCODE_SEED_SUPERADMIN_PASSWORD` / `npx prisma db seed`)
- [ ] Gate automático verde en el mismo commit: `npm run type-check`, `npm run lint`, `npm run test:coverage`, `npm run test:integration` (si hay BD), `npm run test:e2e`

## Humo funcional (web / Vite)

- [ ] Login: tenant `platform`, usuario `ayelen`, contraseña del entorno
- [ ] Navegación: Inicio, Clientes, Artículos, Facturación — sin errores graves en consola
- [ ] Flujo de alta: al menos un cliente o artículo (o cancelar sin persistir) — anotar resultado

## Escritorio (Tauri) — si aplica

- [ ] `npm run dev` / build empaquetado abre ventana; mismo humo que web donde existan rutas
- [ ] Anotar diferencias respecto a Playwright (shell nativo fuera de CI)

## Accesibilidad (manual)

- [ ] Orden de tabulación usable en login y un módulo principal
- [ ] Foco visible; errores de formulario asociados a campos probados

## Criterios de salida

- [ ] Lista completada o defectos registrados con severidad
- [ ] Evidencia adjunta (ticket, capturas, logs)

---

**Otros idiomas:** [English](../../en/quality/manual-qa-checklist.md) · [Português BR](../../pt-br/quality/lista-verificacao-qa-manual.md)
