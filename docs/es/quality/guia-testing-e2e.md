# Guía de Testing E2E — Playwright

**Fecha:** 2026-04-17 | **Estado:** En Progreso | **Cobertura:** 10 tests de critical paths

---

## 🎯 Descripción General

Tests E2E (End-to-End) validan workflows completos de usuario usando [Playwright](https://playwright.dev/). Los tests se ejecutan contra la preview de Vite en `http://127.0.0.1:4173`.

**Suite Actual:**
- `e2e/smoke.spec.ts` — Test básico (app carga)
- `e2e/critical-paths.spec.ts` — 10 tests de workflows críticos

---

## 🚀 Ejecutar Tests E2E

### Inicio Rápido

```bash
# Construir React app e iniciar preview server
npm run build:web
npx vite preview --host 127.0.0.1 --port 4173

# En otra terminal, ejecutar tests E2E
npm run test:e2e
```

### Comando Completo CI (como en GitHub Actions)

```bash
npm run test:e2e
```

Este comando:
1. Construye la app React con `vite build`
2. Inicia preview server en `http://127.0.0.1:4173`
3. Ejecuta tests Playwright en `e2e/**/*.spec.ts`
4. Genera reporte de tests
5. Limpia el servidor

### Ejecutar Test Específico

```bash
# Solo tests de critical-paths
npx playwright test e2e/critical-paths.spec.ts

# Tests que coincidan con patrón
npx playwright test -g "Navigate"

# Modo headed (ver browser)
npx playwright test --headed

# Modo debug (paso a paso)
npx playwright test --debug
```

---

## 📋 Cobertura Actual

### Suite: `critical-paths.spec.ts`

#### Tests de Navegación
- ✅ App carga y muestra home page
- ✅ Navegar a página Clientes
- ✅ Navegar a página Artículos
- ✅ Navegar a página Facturación

#### Tests de Workflows
- ✅ Crear nuevo cliente
  - Abre formulario (F3)
  - Completa campos
  - Guarda con F5
  
- ✅ Crear nuevo artículo
  - Abre formulario (F3)
  - Completa campos
  - Guarda con F5
  
- ✅ Crear nueva factura
  - Navega a facturación
  - Verifica que página carga

#### Tests de Integración
- ✅ Navegación completa entre módulos
- ✅ Atajos de teclado (F3, F5, Esc)
- ✅ App es responsive (mobile viewport)

#### Tests de Validación
- ✅ Validación de CUIT en clientes
- ✅ Validación de precios en artículos

---

## 🔧 Configuración

**Archivo:** `playwright.config.ts`

```typescript
{
  testDir: './e2e',
  baseURL: 'http://127.0.0.1:4173',
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
}
```

---

## 🎯 Próximos Pasos

### Fase 1: Estabilizar Tests Actuales (Semana 1)

- [ ] Agregar `data-testid` a formularios
- [ ] Extraer datos de test en fixtures
- [ ] Agregar guardias `waitForNavigation()`
- [ ] Tests con valores CUIT reales

**Esfuerzo:** 2-3 horas

### Fase 2: Expandir Critical Paths (Semana 2)

**Workflow Completo de Factura:**
```
1. Navegar a /facturacion
2. Crear nueva factura
3. Seleccionar cliente
4. Agregar artículos (tecla Ins)
5. Verificar cálculo de IVA
6. Guardar factura (F5)
7. Verificar en listado
```

**Esfuerzo:** 4-6 horas

### Fase 3: Tests de Autenticación (Semana 3)

- ✅ Login con credenciales válidas
- ✅ Login con credenciales inválidas
- ✅ Rutas protegidas redirigen
- ✅ Logout funciona
- ✅ Persistencia de sesión

**Esfuerzo:** 2-3 horas

---

## 🛠️ Debugging

### Modo Headed (Ver Browser)

```bash
npx playwright test --headed
```

### Modo Debug (Paso a Paso)

```bash
npx playwright test --debug
```

Abre Playwright Inspector para controlar ejecución.

---

## 📝 Escribir Nuevos Tests

### Template

```typescript
test('Descripción de feature', async ({ page }) => {
  // ARRANGE: Preparar datos de test
  const datos = { ... }
  
  // ACT: Realizar acciones de usuario
  await page.goto('/alguna-pagina')
  await page.click('button:has-text("Crear")')
  
  // ASSERT: Verificar resultados
  await expect(page.locator('#resultado')).toHaveText('Éxito')
})
```

### Mejores Prácticas

✅ **SÍ:**
- Nombres claros describiendo qué hacen los usuarios
- Agregar waits: `page.waitForLoadState('networkidle')`
- Usar `data-testid` para selectores estables
- Tests independientes (no depender de otros)

❌ **NO:**
- Hardcodear IDs específicos
- Tests que dependen unos de otros
- Tests de detalles de implementación

---

## 📊 Objetivos de Cobertura

| Métrica | Objetivo | Actual | Estado |
|---------|----------|--------|--------|
| Navigation tests | 5+ | 4 | 🟡 |
| Workflow tests | 3+ | 3 | 🟢 |
| Validation tests | 5+ | 2 | 🔴 |
| Full workflows | 2+ | 0 | 🔴 |

---

**Estado Actual:** 🟡 En Progreso (10 tests, listo para expandir)  
**Próxima Sesión:** Fase 2 (Workflow completo de factura) + Fase 3 (Autenticación)
