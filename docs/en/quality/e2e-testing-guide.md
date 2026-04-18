# E2E Testing Guide — Playwright

**Date:** 2026-04-17 | **Status:** In Progress | **Coverage:** 10 critical path tests

---

## 🎯 Overview

E2E (End-to-End) tests validate complete user workflows using [Playwright](https://playwright.dev/). Tests run against the Vite production preview at `http://127.0.0.1:4173`.

**Current Test Suite:**
- `e2e/smoke.spec.ts` — Basic smoke test (app loads)
- `e2e/critical-paths.spec.ts` — 10 critical workflow tests

---

## 🚀 Running E2E Tests

### Quick Start

```bash
# Build React app and start preview server
npm run build:web
npx vite preview --host 127.0.0.1 --port 4173

# In another terminal, run E2E tests
npm run test:e2e
```

### Full CI Command (as run in GitHub Actions)

```bash
npm run test:e2e
```

This command:
1. Builds React app with `vite build`
2. Starts preview server on `http://127.0.0.1:4173`
3. Runs Playwright tests in `e2e/**/*.spec.ts`
4. Generates test report
5. Cleans up server

### Run Specific Test

```bash
# Run only the critical-paths tests
npx playwright test e2e/critical-paths.spec.ts

# Run tests matching a pattern
npx playwright test -g "Navigate"

# Run in headed mode (see browser)
npx playwright test --headed

# Run with debug mode
npx playwright test --debug
```

### Watch Mode (Development)

```bash
# Run tests continuously as you write
npx playwright test --watch
```

---

## 📋 Current Test Coverage

### Test Suite: `critical-paths.spec.ts`

#### Navigation Tests
- ✅ **App loads and displays home page**
  - Verifies root redirect and page title
  
- ✅ **Navigate to Clientes page**
  - Tests `/clientes` route loads
  
- ✅ **Navigate to Artículos page**
  - Tests `/articulos` route loads
  
- ✅ **Navigate to Facturación page**
  - Tests `/facturacion` route loads

#### Workflow Tests
- ✅ **Create a new cliente (customer)**
  - Opens form (F3 or button click)
  - Fills fields: codigo, razonSocial, email
  - Saves with F5
  - Verifies no error appears
  
- ✅ **Create a new artículo (product)**
  - Opens form (F3 or button click)
  - Fills fields: codigo, descripcion, precio
  - Saves with F5
  - Verifies no error appears
  
- ✅ **Create a new factura (invoice)**
  - Navigates to facturacion page
  - Verifies page loads

#### Integration Tests
- ✅ **Full workflow — Navigate through all main modules**
  - Tests sequential navigation: inicio → clientes → articulos → facturacion
  
- ✅ **Keyboard shortcuts (F3=New, F5=Save, Esc=Cancel)**
  - Verifies F3 opens form
  - Verifies Esc closes form
  
- ✅ **App is responsive on mobile viewport**
  - Tests on 375x812 (iPhone)
  - Tests navigation on mobile

#### Validation Tests
- ✅ **Cliente creation validates CUIT format**
  - Enters invalid CUIT
  - Checks for validation error display
  
- ✅ **Artículo creation validates prices**
  - Enters negative price
  - Checks for validation error

---

## 🔧 Test Configuration

**File:** `playwright.config.ts`

```typescript
{
  testDir: './e2e',                    // Where tests live
  baseURL: 'http://127.0.0.1:4173',   // Base URL for page.goto('/')
  fullyParallel: true,                // Run tests in parallel
  retries: process.env.CI ? 1 : 0,    // 1 retry in CI, 0 in dev
  workers: process.env.CI ? 1 : undefined,  // Single worker in CI
  timeout: 30000,                     // 30 second timeout per test
}
```

---

## 📊 Test Results

### How to Read Output

**Verbose (default in dev):**
```
 ✓ App loads and displays home page (1.2s)
 ✓ Navigate to Clientes page (0.8s)
 ✓ Create a new cliente (customer) (2.3s)
 ...
 10 passed in 25.5s
```

**GitHub Actions (CI):**
```
Running 10 tests using 1 worker
...
10 passed (25.5s)
```

### Common Issues

| Issue | Solution |
|-------|----------|
| `ECONNREFUSED` on 4173 | Preview server didn't start. Check `npm run build:web` output. |
| Tests timeout | Increase timeout in playwright.config.ts or make tests faster. |
| Selectors not found | Element IDs/classes may have changed. Use `--headed --debug` mode. |
| Random failures | Some tests depend on data state. Add `page.waitForLoadState()`. |

---

## 🎯 Next Steps: Improving E2E Coverage

### Phase 1: Stabilize Current Tests (Week 1)

- [ ] Add `data-testid` attributes to forms for reliable selectors
- [ ] Extract test data into fixtures (`e2e/fixtures/`)
- [ ] Add `waitForNavigation()` guards between route changes
- [ ] Test with realistic CUIT values (validate algorithm)

**Effort:** 2-3 hours  
**Benefit:** More reliable, less flaky tests

### Phase 2: Expand Critical Paths (Week 2)

**Full Invoice Creation Workflow:**
```
1. Navigate to /facturacion
2. Create new factura
3. Select cliente from dropdown
4. Add artículo items (Ins key)
5. Verify IVA calculation
6. Save factura (F5)
7. Verify in list
```

**Test Cases:**
- ✅ Create factura A (type A invoice)
- ✅ Create factura B (type B invoice)  
- ✅ Void/annul factura
- ✅ Invoice with multiple items
- ✅ Invoice with discount
- ✅ Invoice calculates IVA correctly

**Effort:** 4-6 hours  
**Benefit:** Full business workflow validated

### Phase 3: Add Authentication Tests (Week 3)

```
1. Login with valid credentials
2. Verify redirect to /inicio
3. Logout
4. Verify redirect to /login
5. Try accessing /clientes while unauthenticated
6. Verify redirect to /login
```

**Test Cases:**
- ✅ Login with valid credentials
- ✅ Login with invalid credentials
- ✅ Protected routes redirect to login
- ✅ Logout works
- ✅ Session persistence

**Effort:** 2-3 hours  
**Prerequisite:** Create test user credentials

### Phase 4: Add Visual Regression Tests (Week 4)

Compare screenshots to catch unintended UI changes.

```bash
npx playwright test --update-snapshots  # Create baselines
npx playwright test                     # Compare to baselines
```

**Effort:** 3-4 hours  
**Benefit:** Prevent visual regressions

---

## 🛠️ Debugging Tests

### Use `--headed` Mode (See Browser)

```bash
npx playwright test --headed
```

Browser opens, tests run, and you can watch interactions.

### Use `--debug` Mode (Step Through)

```bash
npx playwright test --debug
```

Opens Playwright Inspector. Click "Step into" to pause on each action.

### Add Console Logs

```typescript
test('My test', async ({ page }) => {
  console.log('Before navigation')
  await page.goto('/')
  console.log('After navigation')
  console.log('Page URL:', page.url())
})
```

### Inspect Element in Browser

In `--headed` mode, press `Ctrl+Shift+I` to open DevTools.

### Save Test Results

```bash
npm run test:e2e  # Creates HTML report
npx playwright show-trace trace.zip  # View trace
```

---

## 📝 Writing New Tests

### Template

```typescript
test('Feature description', async ({ page }) => {
  // ARRANGE: Set up test data
  const testData = { ... }
  
  // ACT: Perform user actions
  await page.goto('/some-page')
  await page.click('button:has-text("Create")')
  await page.fill('input[name="field"]', testData.value)
  
  // ASSERT: Verify results
  await expect(page.locator('#result')).toHaveText('Success')
})
```

### Best Practices

✅ **DO:**
- Use clear test names describing what users do
- Add waits: `page.waitForLoadState('networkidle')`
- Use `data-testid` attributes for stable selectors
- Keep tests independent (don't depend on other tests)
- Clean up state (delete test data if needed)

❌ **DON'T:**
- Hardcode specific IDs (use `data-testid` instead)
- Create tests that depend on previous tests
- Test implementation details (test user workflows)
- Make tests too granular (test at user-level)
- Ignore waits (lead to flaky tests)

### Selector Strategies (in order of preference)

```typescript
// ✅ BEST: data-testid (explicit, stable)
page.locator('[data-testid="submit-button"]')

// ✅ GOOD: Accessible selectors
page.locator('button:has-text("Create")')
page.locator('[aria-label="Delete"]')
page.locator('[role="dialog"]')

// ⚠️ OKAY: CSS selectors (fragile)
page.locator('.form-group input[name="email"]')

// ❌ AVOID: Absolute XPath
page.locator('/html/body/div[1]/div[2]/button')
```

---

## 📊 Coverage Targets

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| Navigation tests | 5+ | 4 | 🟡 |
| Workflow tests | 3+ | 3 | 🟢 |
| Validation tests | 5+ | 2 | 🔴 |
| Full workflows | 2+ | 0 | 🔴 |
| Critical paths | 6+ | 3 partial | 🟡 |

---

## 🔗 Related Documents

- [Testing Strategy](testing-strategy.md)
- [Playwright Documentation](https://playwright.dev/docs/intro)
- [Quality Gates Enforcement](quality-gates-enforcement.md)
- [CI/CD Pipeline](ci-cd.md)

---

## 🎯 Success Criteria

E2E tests are "done" when:
- ✅ All critical paths covered (login, CRUD, workflows)
- ✅ Tests pass consistently (no flakiness)
- ✅ Coverage >80% of critical code paths
- ✅ Data validation tested (CUIT, prices, etc)
- ✅ Responsive design verified (mobile + desktop)
- ✅ Part of CI/CD pipeline (runs on every PR)

---

**Current Status:** 🟡 In Progress (10 tests, ready to expand)  
**Next Session:** Phase 2 (Full invoice workflow) + Phase 3 (Authentication)
