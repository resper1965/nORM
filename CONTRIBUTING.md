# Contribuindo

## Como Contribuir

1. Fork o repositório
2. Crie uma branch (`git checkout -b feature/nova-feature`)
3. Faça suas alterações
4. Adicione testes
5. Commit (`git commit -m 'feat: adiciona feature'`)
6. Push (`git push origin feature/nova-feature`)
7. Abra um Pull Request

## Setup

```bash
git clone https://github.com/resper1965/nORM.git
cd nORM
npm install
cp .env.example .env.local
npm run dev
```

## Padrões

### Commits
Usamos [Conventional Commits](https://www.conventionalcommits.org/):

```
feat(scope): add new feature
fix(scope): fix bug
docs: update documentation
refactor: refactor code
test: add tests
chore: update dependencies
```

### Código
- TypeScript para todo código
- Evite `any` - use tipos específicos
- Testes para novas features
- Lint deve passar

### Estrutura
```
lib/
  ├── actions/     # Server actions
  ├── ai/          # Integrações IA
  ├── auth/        # Autenticação
  ├── config/      # Configurações
  ├── data/        # Data fetching
  ├── errors/      # Error handling
  ├── reputation/  # Cálculo reputação
  ├── scraping/    # Web scraping
  ├── social/      # Integrações sociais
  └── utils/       # Utilitários
```

## Testes

```bash
npm test              # Unit tests
npm run test:coverage # Com cobertura
npm run test:e2e      # E2E tests
```

## Processo de Review

1. CI checks devem passar (lint, tests, build)
2. Code review necessário
3. Documentação atualizada
4. Cobertura de testes mantida
