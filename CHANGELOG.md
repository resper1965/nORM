# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere a [Semantic Versioning](https://semver.org/lang/pt-BR/).

## [Unreleased]

### 🔄 Changed (2025-01-02)
- **Merge de branches**: Integradas branches `claude/check-app-status-2Wsqk`, `claude/review-repository-ffN9n` e `cursor/implement-application-with-spec-kit-d98e`
- **Correções de build**: Resolvidos conflitos de merge e erros de tipo TypeScript
- **Dependências**: Adicionada `@ai-sdk/google` para suporte Gemini
- **Refatoração**: Removido arquivo duplicado `lib/utils/crypto.ts`, mantendo apenas `lib/utils/encryption.ts`
- **Imports**: Corrigidos imports em múltiplos arquivos (wordpress, cron jobs, integrations)
- **Tipos**: Corrigidos tipos de model AI (`gpt-4` → `pro` para compatibilidade com Gemini)
- **Layout**: Removida referência a `montserrat` não definido

### Em Desenvolvimento
- Sistema de notificações em tempo real
- Dashboard analytics avançado
- Exportação de relatórios em PDF

## [1.0.0] - 2025-12-30

### ✨ Added

#### Core Features
- Dashboard de reputação online com métricas em tempo real
- Sistema de autenticação completo via Supabase Auth
- Monitoramento multi-plataforma (Instagram, LinkedIn, Facebook, WordPress, News)
- Análise de sentimento com OpenAI GPT-4
- Calculadora de score de reputação
- Sistema de alertas e notificações
- Gestão de clientes e perfis
- Tracking de palavras-chave e menções
- Histórico de métricas e tendências

#### AI & Content
- AI Gateway com cache inteligente (TTL 1h)
- Fallback automático (GPT-4 → GPT-4-turbo → GPT-3.5)
- Streaming de conteúdo com Vercel AI SDK
- Gerador de conteúdo assistido por IA
- Análise de sentimento automática
- Tracking de custo de APIs de IA

#### Monitoring & Analytics
- Performance monitoring (Web Vitals, LCP, CLS)
- Cost tracking system com alertas de orçamento
- Rate limiting (100 req/hour)
- Sistema de retry com exponential backoff
- Logs estruturados de operações

#### UI/UX
- Design system com shadcn/ui e Tailwind CSS
- Tema claro/escuro
- Sistema de toast notifications
- Onboarding tour interativo
- Interface responsiva mobile-first
- Internacionalização (pt-BR, en-US)

#### Infrastructure
- Deploy 100% em plano gratuito (Vercel FREE + Supabase FREE)
- GitHub Actions para cron jobs (FREE)
- Migrations automáticas do Supabase
- Edge Functions no Supabase
- Row Level Security (RLS) em todas as tabelas

#### Testing
- Testes unitários com Vitest (50+ testes)
- Testes de integração para APIs
- Testes E2E com Playwright
- Cobertura de testes > 80%

#### Documentation
- README completo com quickstart
- DEPLOY-GUIDE.md (600+ linhas)
- FREE-TIER-SETUP.md (400+ linhas)
- AI-GATEWAY.md (500+ linhas)
- JSDoc completo em services críticos

### 🔧 Changed
- Migrado de cron jobs do Vercel para GitHub Actions (economia de $20/mês)
- Otimizado queries do Supabase com índices adequados
- Melhorado sistema de cache para reduzir chamadas de API
- Atualizado design do dashboard para melhor UX

### 🛡️ Security
- Headers de segurança configurados (CSP, X-Frame-Options, etc.)
- Row Level Security em todas as tabelas
- Sanitização de inputs com Zod
- Rate limiting em endpoints públicos
- Secrets em variáveis de ambiente
- HTTPS obrigatório

### 📚 Documentation
- Guia completo de contribuição (CONTRIBUTING.md)
- Código de conduta (CODE_OF_CONDUCT.md)
- Política de segurança (SECURITY.md)
- Templates de Issue e PR
- Documentação de API (OpenAPI 3.0)

### 🐛 Fixed
- Corrigido cálculo de score de reputação com weights adequados
- Resolvido problema de timezone em métricas históricas
- Corrigido rate limiting do Instagram API
- Ajustado cache TTL para otimizar custos

## [0.9.0] - 2025-12-29

### ✨ Added
- Implementação completa das 8 User Stories do MVP
- Sistema de integração com Instagram Graph API
- Sistema de integração com LinkedIn API v2
- Sistema de integração com Facebook Graph API
- Sistema de integração com WordPress REST API
- Sistema de monitoramento de notícias (SerpAPI)
- Páginas de alertas e notificações
- Páginas de SEO e tracking

### 🔧 Changed
- Refatorado estrutura de components para melhor organização
- Otimizado bundle size com dynamic imports
- Melhorado performance de queries com pagination

### 🐛 Fixed
- Corrigido React Server Components CVE vulnerabilities
- Resolvido problema de autenticação com tokens expirados
- Ajustado formatação de datas para timezone local

## [0.5.0] - 2025-11-06

### ✨ Added
- Planejamento técnico completo (plan.md)
- Breakdown de tarefas (tasks.md - 97 tasks)
- Data model completo (data-model.md)
- Contratos de API (OpenAPI 3.0)
- Schema do Supabase (SQL)
- Quickstart guide para desenvolvedores

### 📚 Documentation
- Constituição do projeto (10 princípios)
- Especificação completa do MVP (spec.md)
- CLAUDE.md com guidelines de desenvolvimento

## [0.1.0] - 2025-11-06

### ✨ Added
- Setup inicial do projeto com Next.js 14
- Configuração do Supabase
- Estrutura básica do monorepo
- Configuração de TypeScript e ESLint
- Setup do Tailwind CSS
- Integração com Spec Kit

---

## Tipos de Mudanças

- `✨ Added` - Novas features
- `🔧 Changed` - Mudanças em features existentes
- `🗑️ Deprecated` - Features que serão removidas
- `❌ Removed` - Features removidas
- `🐛 Fixed` - Correções de bugs
- `🛡️ Security` - Correções de vulnerabilidades
- `📚 Documentation` - Mudanças na documentação
- `⚡ Performance` - Melhorias de performance
- `♻️ Refactor` - Refatorações de código

## Formato de Versionamento

O projeto usa [Semantic Versioning](https://semver.org/lang/pt-BR/):

- **MAJOR** (X.0.0): Mudanças incompatíveis na API
- **MINOR** (0.X.0): Novas funcionalidades compatíveis
- **PATCH** (0.0.X): Correções de bugs compatíveis

## Releases

### Como Criar um Release

1. Atualize este CHANGELOG.md com as mudanças
2. Atualize a versão no package.json
3. Crie uma tag git: `git tag -a v1.0.0 -m "Release v1.0.0"`
4. Push a tag: `git push origin v1.0.0`
5. Crie um GitHub Release com as notas do changelog

### Release Checklist

- [ ] CHANGELOG.md atualizado
- [ ] package.json version atualizado
- [ ] README.md atualizado (se necessário)
- [ ] Testes passando
- [ ] Build sem erros
- [ ] Documentation atualizada
- [ ] Migration guide (se breaking changes)

## Links Úteis

- [Issues](https://github.com/resper1965/nORM/issues)
- [Pull Requests](https://github.com/resper1965/nORM/pulls)
- [Discussions](https://github.com/resper1965/nORM/discussions)
- [Releases](https://github.com/resper1965/nORM/releases)

---

**Formato**: [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/)
**Versionamento**: [Semantic Versioning](https://semver.org/lang/pt-BR/)
