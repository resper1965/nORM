# Guia de Contribuição - nORM

Obrigado por considerar contribuir com o nORM! Este documento fornece diretrizes para contribuir com o projeto.

## 📋 Índice

- [Código de Conduta](#código-de-conduta)
- [Como Posso Contribuir?](#como-posso-contribuir)
- [Desenvolvimento Local](#desenvolvimento-local)
- [Processo de Pull Request](#processo-de-pull-request)
- [Style Guide](#style-guide)
- [Commit Messages](#commit-messages)
- [Testes](#testes)

## 📜 Código de Conduta

Este projeto adere ao [Código de Conduta](CODE_OF_CONDUCT.md). Ao participar, você concorda em manter um ambiente respeitoso e inclusivo.

## 🤝 Como Posso Contribuir?

### Reportar Bugs

Antes de criar um bug report:
- Verifique se o bug já não foi reportado
- Use a versão mais recente do projeto
- Colete informações sobre o ambiente (OS, browser, versão)

Use o [template de bug report](.github/ISSUE_TEMPLATE/bug_report.md) para criar a issue.

### Sugerir Features

Antes de sugerir uma feature:
- Verifique se já não existe uma issue similar
- Explique claramente o problema que a feature resolve
- Forneça exemplos de uso

Use o [template de feature request](.github/ISSUE_TEMPLATE/feature_request.md) para criar a issue.

### Contribuir com Código

1. Encontre uma issue para trabalhar (ou crie uma nova)
2. Comente na issue que você vai trabalhar nela
3. Faça fork do repositório
4. Crie uma branch a partir de `main`
5. Faça suas mudanças
6. Adicione testes
7. Envie um Pull Request

## 💻 Desenvolvimento Local

### Pré-requisitos

- Node.js 18.17 ou superior
- npm, yarn ou pnpm
- Conta Supabase (para desenvolvimento)
- Chaves de API para serviços externos (OpenAI, SerpAPI, etc.)

### Setup

1. **Clone o repositório**
   ```bash
   git clone https://github.com/resper1965/nORM.git
   cd nORM
   ```

2. **Instale as dependências**
   ```bash
   npm install
   # ou
   pnpm install
   ```

3. **Configure as variáveis de ambiente**
   ```bash
   cp .env.example .env.local
   ```

   Preencha as variáveis necessárias no `.env.local`

4. **Configure o Supabase**

   Siga as instruções em [FREE-TIER-SETUP.md](FREE-TIER-SETUP.md#2-configurar-supabase)

5. **Execute o projeto**
   ```bash
   npm run dev
   ```

### Estrutura do Projeto

```
nORM/
├── app/                    # Next.js App Router
│   ├── [locale]/          # Rotas i18n
│   └── api/               # API routes
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   └── [feature]/        # Feature-specific components
├── lib/                   # Utilities e services
│   ├── ai/               # AI services (OpenAI, sentiment)
│   ├── api/              # External API clients
│   ├── hooks/            # React hooks
│   ├── monitoring/       # Monitoring e tracking
│   └── utils/            # Utility functions
├── supabase/             # Supabase migrations e schema
├── tests/                # Testes
│   ├── unit/            # Testes unitários
│   ├── integration/     # Testes de integração
│   └── e2e/             # Testes E2E (Playwright)
└── .specify/            # Spec Kit (feature specs e plans)
```

## 🔄 Processo de Pull Request

### 1. Crie uma Branch

Use nomes descritivos:

```bash
# Features
git checkout -b feature/add-user-authentication

# Bug fixes
git checkout -b fix/login-validation-error

# Refactoring
git checkout -b refactor/api-client-structure

# Documentation
git checkout -b docs/update-readme
```

### 2. Faça Suas Mudanças

- Escreva código limpo e manutenível
- Siga o style guide do projeto
- Adicione comentários em código complexo
- Mantenha commits atômicos e bem descritos

### 3. Adicione Testes

- Testes unitários para lógica de negócio
- Testes de integração para APIs
- Testes E2E para fluxos críticos

```bash
# Execute os testes
npm run test

# Execute testes E2E
npm run test:e2e
```

### 4. Atualize a Documentação

- README.md para mudanças de setup
- JSDoc para funções públicas
- Guias específicos para features complexas

### 5. Envie o Pull Request

- Use o [template de PR](.github/PULL_REQUEST_TEMPLATE.md)
- Preencha todas as seções relevantes
- Link para a issue relacionada
- Adicione screenshots para mudanças visuais
- Marque como draft se ainda estiver em progresso

### 6. Code Review

- Responda aos comentários prontamente
- Faça as mudanças solicitadas
- Marque conversas como resolvidas após implementar

### 7. Merge

Após aprovação:
- Squash commits se necessário
- Mantenha um histórico limpo
- Delete a branch após merge

## 🎨 Style Guide

### TypeScript

```typescript
// ✅ BOM
export async function calculateReputationScore(
  userId: string,
  timeframe: 'week' | 'month' | 'year'
): Promise<number> {
  // Implementação clara e bem tipada
  const metrics = await fetchUserMetrics(userId, timeframe)
  return computeScore(metrics)
}

// ❌ RUIM
export async function calc(id: any, t: string): Promise<any> {
  // Tipagem fraca, nomes não descritivos
  const m = await fetch(id, t)
  return compute(m)
}
```

### React Components

```typescript
// ✅ BOM - Componente funcional com tipos
interface UserCardProps {
  user: User
  onEdit: (userId: string) => void
}

export function UserCard({ user, onEdit }: UserCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{user.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <Button onClick={() => onEdit(user.id)}>Edit</Button>
      </CardContent>
    </Card>
  )
}

// ❌ RUIM - Props sem tipos, component name não descritivo
export function UC(props: any) {
  return <div onClick={props.onClick}>{props.name}</div>
}
```

### Naming Conventions

- **Arquivos**: `kebab-case.ts`, `user-profile.tsx`
- **Componentes**: `PascalCase` - `UserProfile`, `DashboardLayout`
- **Funções**: `camelCase` - `calculateScore`, `fetchUserData`
- **Constantes**: `UPPER_SNAKE_CASE` - `API_BASE_URL`, `MAX_RETRIES`
- **Tipos/Interfaces**: `PascalCase` - `User`, `ApiResponse<T>`

### Formatação

O projeto usa Prettier para formatação automática:

```bash
npm run format
```

### Linting

O projeto usa ESLint:

```bash
npm run lint
```

## 📝 Commit Messages

Usamos [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Tipos

- `feat`: Nova feature
- `fix`: Correção de bug
- `docs`: Mudanças na documentação
- `style`: Formatação, missing semicolons, etc
- `refactor`: Refatoração de código
- `perf`: Melhorias de performance
- `test`: Adicionar ou corrigir testes
- `chore`: Manutenção, dependências, build

### Exemplos

```bash
# Feature
feat(dashboard): adicionar filtro de período customizado

# Bug fix
fix(api): corrigir rate limiting no Instagram API client

# Breaking change
feat(auth)!: migrar para OAuth 2.0

BREAKING CHANGE: Auth agora requer OAuth 2.0. Credenciais antigas não funcionam mais.

# Multiple scopes
fix(api,ui): corrigir sincronização de dados entre API e UI
```

### Scopes Comuns

- `api`: API routes e clients
- `ui`: Componentes de interface
- `dashboard`: Dashboard pages
- `auth`: Autenticação
- `db`: Database e migrations
- `monitoring`: Monitoring e analytics
- `docs`: Documentação
- `ci`: CI/CD workflows

## 🧪 Testes

### Testes Unitários

```typescript
// tests/unit/lib/reputation/calculator.test.ts
import { describe, it, expect } from 'vitest'
import { calculateReputationScore } from '@/lib/reputation/calculator'

describe('calculateReputationScore', () => {
  it('should calculate correct score with positive sentiment', () => {
    const metrics = { sentiment: 0.8, engagement: 100, reach: 1000 }
    const score = calculateReputationScore(metrics)
    expect(score).toBeGreaterThan(75)
  })

  it('should handle missing metrics gracefully', () => {
    const metrics = { sentiment: 0, engagement: 0, reach: 0 }
    const score = calculateReputationScore(metrics)
    expect(score).toBe(0)
  })
})
```

### Testes E2E

```typescript
// tests/e2e/dashboard.spec.ts
import { test, expect } from '@playwright/test'

test('should display dashboard after login', async ({ page }) => {
  await page.goto('/pt/login')
  await page.fill('input[name="email"]', 'test@example.com')
  await page.fill('input[name="password"]', 'password123')
  await page.click('button[type="submit"]')

  await expect(page).toHaveURL(/\/pt\/dashboard/)
  await expect(page.locator('h1')).toContainText('Dashboard')
})
```

### Executar Testes

```bash
# Todos os testes unitários
npm run test

# Testes em modo watch
npm run test:watch

# Testes com cobertura
npm run test:coverage

# Testes E2E
npm run test:e2e

# Testes E2E em modo UI
npm run test:e2e:ui
```

## 🔒 Segurança

- Nunca commite credenciais ou secrets
- Use variáveis de ambiente para configuração
- Reporte vulnerabilidades via [Security Policy](SECURITY.md)
- Siga OWASP Top 10 guidelines

## 📚 Recursos

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React Documentation](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com/docs)

## ❓ Dúvidas?

- Abra uma [Discussion](https://github.com/resper1965/nORM/discussions)
- Consulte a [documentação](README.md)
- Entre em contato com os mantenedores

## 📄 Licença

Ao contribuir, você concorda que suas contribuições serão licenciadas sob a mesma licença do projeto.

---

**Obrigado por contribuir com o nORM! 🎉**
