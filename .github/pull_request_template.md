# Pull Request Checklist

## Linked Issue

**Required** for any work tracked on the GitHub Project **BizCode Delivery**: replace the placeholder with the real issue number so the project links the PR and automation can update **Status** (In Progress / Done).

- Closes #<!-- e.g. 48 — must match an issue on the board -->

## What Changed / Why

- TBD

## Evidence

- [ ] `npm run lint`
- [ ] `npm run type-check`
- [ ] `npm run test`
- [ ] `npm run check:docs-map`
- [ ] If applicable: `npm run docs:generate` and no generated-doc drift
- [ ] If applicable: OpenAPI updated (`docs/api/openapi.yaml`) + contract impact checked

## Documentation

- [ ] `docs/es` updated (if applicable)
- [ ] `docs/en` updated (if applicable)
- [ ] `docs/pt-br` updated (if applicable)
- [ ] ISO evidence links added (if applicable)

## Risk and Rollback

- **Risk level:** low / medium / high
- **Rollback plan:**
