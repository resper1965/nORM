# 🤝 Guia de Contribuição - n.ORM

Obrigado por considerar contribuir para o n.ORM! Este documento fornece diretrizes e informações sobre como contribuir para o projeto.

## 📋 Índice

- [Código de Conduta](#código-de-conduta)
- [Como Contribuir](#como-contribuir)
- [Configuração do Ambiente](#configuração-do-ambiente)
- [Padrões de Código](#padrões-de-código)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Processo de Desenvolvimento](#processo-de-desenvolvimento)
- [Testes](#testes)
- [Documentação](#documentação)
- [Pull Requests](#pull-requests)

---

## 📜 Código de Conduta

Este projeto segue o [Código de Conduta](CODE_OF_CONDUCT.md). Ao participar, você concorda em manter este código.

---

## 🚀 Como Contribuir

### Reportar Bugs

1. Verifique se o bug já não foi reportado nas [Issues](https://github.com/resper1965/nORM/issues)
2. Se não existir, crie uma nova issue com:
   - Título claro e descritivo
   - Descrição detalhada do problema
   - Passos para reproduzir
   - Comportamento esperado vs. atual
   - Screenshots (se aplicável)
   - Ambiente (OS, versão do Node, etc.)

### Sugerir Features

1. Verifique se a feature já não foi sugerida
2. Crie uma issue com:
   - Título claro
   - Descrição detalhada da feature
   - Casos de uso
   - Benefícios esperados

### Contribuir com Código

1. Fork o repositório
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Faça suas alterações
4. Adicione testes
5. Certifique-se de que todos os testes passam
6. Commit suas mudanças (`git commit -m 'feat: adiciona nova feature'`)
7. Push para a branch (`git push origin feature/nova-feature`)
8. Abra um Pull Request

---

## ⚙️ Configuração do Ambiente

### Pré-requisitos

- Node.js >= 18.0.0
- npm >= 9.0.0
- Conta no Supabase (para desenvolvimento)
- Conta no Vercel (opcional, para deploy)

### Setup Inicial

```bash
# Clone o repositório
git clone https://github.com/resper1965/nORM.git
cd nORM

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env.local

# Edite .env.local com suas credenciais
# NEXT_PUBLIC_SUPABASE_URL=...
# NEXT_PUBLIC_SUPABASE_ANON_KEY=...
# OPENAI_API_KEY=...
# etc.

# Execute as migrations do Supabase
# (Veja docs/setup/ para instruções detalhadas)

# Inicie o servidor de desenvolvimento
npm run dev
```

### Scripts Disponíveis

```bash
npm run dev          # Inicia servidor de desenvolvimento
npm run build        # Build para produção
npm run start        # Inicia servidor de produção
npm run lint         # Executa ESLint
npm test             # Executa testes unitários
npm run test:ui      # Executa testes com UI
npm run test:coverage # Executa testes com cobertura
npm run test:e2e     # Executa testes E2E (Playwright)
```

---

## 📝 Padrões de Código

### TypeScript

- Use TypeScript para todo o código
- Evite `any` - use tipos específicos
- Use interfaces para objetos
- Use enums para constantes relacionadas

### Convenções de Nomenclatura

- **Arquivos**: kebab-case (`user-profile.tsx`)
- **Componentes**: PascalCase (`UserProfile.tsx`)
- **Funções/Variáveis**: camelCase (`getUserProfile`)
- **Constantes**: UPPER_SNAKE_CASE (`MAX_RETRIES`)
- **Tipos/Interfaces**: PascalCase (`UserProfile`)

### Estrutura de Arquivos

```
lib/
  ├── actions/        # Server actions (Next.js)
  ├── ai/             # Integrações com IA
  ├── auth/           # Autenticação e autorização
  ├── config/         # Configurações
  ├── data/           # Data fetching
  ├── errors/         # Error handling
  ├── monitoring/     # Monitoramento e métricas
  ├── notifications/  # Notificações (email, etc.)
  ├── reputation/    # Cálculo de reputação
  ├── scraping/       # Web scraping
  ├── social/         # Integrações sociais
  ├── supabase/       # Cliente Supabase
  ├── types/          # TypeScript types
  ├── utils/          # Utilitários
  └── wordpress/      # Integração WordPress
```

### Formatação

- Use Prettier (configurado no projeto)
- Linha máxima: 100 caracteres
- Use 2 espaços para indentação
- Sem ponto e vírgula no final (configurado)

### Imports

```typescript
// 1. React/Next.js
import { useState } from 'react';
import { NextRequest } from 'next/server';

// 2. Bibliotecas externas
import axios from 'axios';

// 3. Utilitários internos
import { logger } from '@/lib/utils/logger';
import { createClient } from '@/lib/supabase/server';

// 4. Tipos
import type { Client } from '@/lib/types/domain';
```

---

## 🏗️ Estrutura do Projeto

```
nORM/
├── app/                    # Next.js App Router
│   ├── [locale]/          # Rotas internacionalizadas
│   └── api/                # API Routes
├── components/             # Componentes React
│   ├── ui/                 # Componentes base (shadcn/ui)
│   └── ...                 # Componentes específicos
├── lib/                    # Código da aplicação
├── supabase/               # Migrations e configuração Supabase
│   └── migrations/         # SQL migrations
├── tests/                  # Testes
│   ├── unit/               # Testes unitários
│   ├── integration/        # Testes de integração
│   └── e2e/                # Testes end-to-end
├── docs/                   # Documentação
└── public/                 # Arquivos estáticos
```

---

## 🔄 Processo de Desenvolvimento

### 1. Criar uma Branch

```bash
# Branch para features
git checkout -b feature/nome-da-feature

# Branch para bugs
git checkout -b fix/nome-do-bug

# Branch para docs
git checkout -b docs/nome-da-doc
```

### 2. Desenvolvimento

- Faça commits frequentes e pequenos
- Use mensagens de commit descritivas
- Siga o padrão de commits: `tipo: descrição`

**Tipos de commit:**
- `feat:` Nova feature
- `fix:` Correção de bug
- `docs:` Documentação
- `style:` Formatação
- `refactor:` Refatoração
- `test:` Testes
- `chore:` Tarefas de manutenção

### 3. Testes

- Adicione testes para novas features
- Certifique-se de que todos os testes passam
- Mantenha cobertura acima de 80%

### 4. Documentação

- Atualize a documentação se necessário
- Adicione comentários JSDoc para funções complexas
- Atualize o CHANGELOG.md

---

## 🧪 Testes

### Testes Unitários

```typescript
// tests/unit/lib/reputation/calculator.test.ts
import { describe, it, expect } from 'vitest';
import { calculateReputationScore } from '@/lib/reputation/calculator';

describe('calculateReputationScore', () => {
  it('should calculate score correctly', async () => {
    // Test implementation
  });
});
```

### Testes de Integração

```typescript
// tests/integration/api/clients.test.ts
import { describe, it, expect } from 'vitest';

describe('API: /api/clients', () => {
  it('should return clients list', async () => {
    // Test implementation
  });
});
```

### Executar Testes

```bash
# Todos os testes
npm test

# Testes com UI
npm run test:ui

# Cobertura
npm run test:coverage

# E2E
npm run test:e2e
```

---

## 📚 Documentação

### Comentários JSDoc

```typescript
/**
 * Calcula o score de reputação de um cliente
 * 
 * @param params - Parâmetros de cálculo
 * @param params.clientId - ID do cliente
 * @param params.periodStart - Início do período
 * @param params.periodEnd - Fim do período
 * @returns Score e breakdown detalhado
 * 
 * @example
 * ```typescript
 * const result = await calculateReputationScore({
 *   clientId: 'uuid',
 *   periodStart: new Date('2025-01-01'),
 *   periodEnd: new Date('2025-01-31')
 * });
 * ```
 */
export async function calculateReputationScore(
  params: CalculateScoreParams
): Promise<{ score: number; breakdown: ScoreBreakdown }> {
  // ...
}
```

### Documentação de Features

- Adicione documentação em `docs/` para novas features
- Use Markdown
- Inclua exemplos de uso

---

## 🔀 Pull Requests

### Antes de Abrir um PR

- [ ] Código segue os padrões do projeto
- [ ] Todos os testes passam
- [ ] Documentação atualizada
- [ ] CHANGELOG.md atualizado
- [ ] Sem conflitos com `main`

### Template de PR

```markdown
## Descrição
Breve descrição das mudanças

## Tipo de Mudança
- [ ] Bug fix
- [ ] Nova feature
- [ ] Breaking change
- [ ] Documentação

## Checklist
- [ ] Testes adicionados/atualizados
- [ ] Documentação atualizada
- [ ] Código revisado
- [ ] Sem warnings do linter
```

### Revisão

- PRs serão revisados por mantenedores
- Feedback será fornecido via comentários
- Mudanças podem ser solicitadas antes do merge

---

## 🐛 Debugging

### Logs

```typescript
import { logger } from '@/lib/utils/logger';

logger.debug('Debug message', { metadata });
logger.info('Info message', { metadata });
logger.warn('Warning message', { metadata });
logger.error('Error message', error, { metadata });
```

### Vercel Logs

Em produção, logs são automaticamente enviados para Vercel Logs:
- Acesse: Vercel Dashboard → Deployments → Logs

---

## 📞 Suporte

- **Issues**: [GitHub Issues](https://github.com/resper1965/nORM/issues)
- **Documentação**: [docs/](./docs/)
- **Email**: contato@bekaa.eu

---

## 🎯 Roadmap

Veja o [ROADMAP.md](./docs/ROADMAP.md) para features planejadas.

---

**Obrigado por contribuir! 🎉**
