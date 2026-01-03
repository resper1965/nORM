# Changelog

Mudanças notáveis do projeto. Formato baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/).

## [Unreleased]

### Changed (2025-01-02)
- Merge de branches: claude/check-app-status-2Wsqk, claude/review-repository-ffN9n, cursor/implement-application-with-spec-kit-d98e
- Correções de build: conflitos de merge e erros de tipo TypeScript
- Dependências: adicionada @ai-sdk/google para suporte Gemini
- Refatoração: removido lib/utils/crypto.ts duplicado
- Imports: corrigidos em wordpress, cron jobs, integrations
- Tipos: corrigidos tipos de model AI (gpt-4 → pro)

## [1.0.0] - 2025-12-30

### Added
- Dashboard de reputação online
- Autenticação via Supabase Auth
- Monitoramento multi-plataforma (Instagram, LinkedIn, Facebook, WordPress, News)
- Análise de sentimento com OpenAI GPT-4
- Calculadora de score de reputação
- Sistema de alertas e notificações
- Gestão de clientes e perfis
- Tracking de palavras-chave e menções
- AI Gateway com cache (TTL 1h)
- Performance monitoring (Web Vitals)
- Cost tracking system
- Rate limiting (100 req/hour)

### Security
- RLS habilitado em todas as tabelas
- Criptografia de tokens (AES-256-GCM)
- Validação de dados (Zod)
- Proteção de cron jobs
