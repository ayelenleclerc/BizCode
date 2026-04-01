# Quality Record Templates

## Template: Nonconformity Record

**Standard reference:** ISO 9001:2015 §10.2.2

```
Nonconformity #: NC-YYYYMMDD-NNN
Detection date: YYYY-MM-DD
Detected by: [name / CI pipeline]
Stage: [ ] Code review  [ ] CI  [ ] Manual test  [ ] Production

DESCRIPTION:
Briefly describe the nonconformity (what happened, where, when).

ROOT CAUSE (5 Whys):
1. Why did it happen? →
2. Why did that happen? →
3. Why did that happen? →
4. Why did that happen? →
5. Root cause identified:

CORRECTIVE ACTION:
Describe the fix implemented. Commit or PR reference: #XXX

PREVENTIVE ACTION:
Describe the measure to prevent recurrence
(e.g. new test case, new ESLint rule, DoD update).

VERIFICATION:
[ ] Test that reproduces the bug was added and passes
[ ] CI pipeline green with the fix
[ ] Reviewed by:                     Date:

Status: [ ] Open  [ ] In progress  [ ] Closed
Closure date:
```

---

## Template: Change Record

```
Change #: CHG-YYYYMMDD-NNN
Type: [ ] Feature  [ ] Fix  [ ] Refactor  [ ] Docs  [ ] CI/CD
PR/Commit: #XXX

CHANGE DESCRIPTION:

AFFECTED FILES:
-
-

TEST IMPACT:
[ ] Existing tests still pass
[ ] New tests added: (describe)
[ ] Coverage affected: (before / after)

ACCESSIBILITY IMPACT:
[ ] N/A  [ ] Reviewed with axe DevTools  [ ] jsx-a11y no new warnings

I18N IMPACT:
[ ] No new/modified strings
[ ] New keys added to all 3 locales and check:i18n passes

APPROVED BY:                         Date:
```

---

## Template: Manual Test Session Record

```
Test Session #: TS-YYYYMMDD-NNN
Date: YYYY-MM-DD
Version under test: (commit hash or tag)
Tester:

ENVIRONMENT:
OS: [ ] Windows 11  [ ] macOS  [ ] Linux
Mode: [ ] Dev (Vite)  [ ] Tauri build

TEST CASES:

| # | Scenario | Result | Notes |
|---|---|---|---|
| 1 | Create new customer with valid CUIT | [ ] Pass  [ ] Fail | |
| 2 | Create customer with invalid CUIT — see error | [ ] Pass  [ ] Fail | |
| 3 | Search customer by name | [ ] Pass  [ ] Fail | |
| 4 | Edit existing customer | [ ] Pass  [ ] Fail | |
| 5 | Create new product | [ ] Pass  [ ] Fail | |
| 6 | Issue Factura A to RI with 2 mixed items (21% and 10.5%) | [ ] Pass  [ ] Fail | |
| 7 | Verify VAT calculation on invoice (net × rate = VAT) | [ ] Pass  [ ] Fail | |
| 8 | Issue Factura B to CF (VAT not itemized) | [ ] Pass  [ ] Fail | |
| 9 | Navigate table with keyboard (↑↓ Enter) | [ ] Pass  [ ] Fail | |
| 10 | Verify language switch (ES → EN → PT-BR) | [ ] Pass  [ ] Fail | |

DEFECTS FOUND:
(Reference NC if a nonconformity is opened)

VERDICT: [ ] Approved  [ ] Approved with observations  [ ] Rejected

Tester signature:                     Date:
```
