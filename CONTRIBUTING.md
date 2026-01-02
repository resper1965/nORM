# Contributing to nORM

## Development Process

1.  **Fork & Clone**: Use a feature branch.
2.  **Install**: `npm install` (respects `package-lock.json`).
3.  **Code**: Follow strict TypeScript standards.
4.  **Local Test**: Run `npm run validate` before committing.

## Security Gates

Your PR will automatically fail if:

- **Linting** fails (`npm run lint:security`).
- **Tests** fail (`npm run test`).
- **Vulnerabilities** are found in dependencies (High/Critical) (`npm run audit:deps`).
- **Secrets** are detected in code.

## Style Guide

- Use `eslint` configuration provided.
- Avoid `any` types.
- Do not use inline styles or unsafe functions (`eval`, `innerHTML`).
