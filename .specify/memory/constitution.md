# Ness Theme / Spec Kit Constitution

## Core Principles

### I. Consistência de Marca Ness
Manter o sistema visual "Ness" como referência única para cores, tipografia e componentes. Qualquer nova tela precisa herdar tokens do `lib/branding/theme.ts` e validar contraste mínimo AA, em modo claro e escuro.

### II. UX Multilíngue Centrada em Dashboard
Toda experiência deve funcionar com `next-intl`, refletindo conteúdo em pt, en e es. As jornadas principais (analytics, calendário, documentos, pricing, configurações) precisam permanecer intuitivas no layout de dashboard.

### III. Segurança, Dados e Observabilidade com Supabase
Integrações com Supabase devem usar os clientes de `lib/supabase/` para garantir sessão, cookies e rate limits. Erros devem ser capturados via `lib/utils/logger.ts` e convertidos em `AppError` para monitoramento.

### IV. Performance e Responsividade
As telas devem carregar em < 2s em desktop e adaptar-se a mobile/tablet via componentes responsivos. Skeletons de carregamento (`app/[locale]/loading.tsx`) são obrigatórios em fluxos com dados remotos.

### V. Qualidade Guiada por BMAD
O processo de desenvolvimento segue checklists BMAD, com validação de variáveis de ambiente, error boundaries e testes mínimos antes de merge. Toda melhoria crítica citada em `CRITICAS-E-MELHORIAS.md` deve permanecer endereçada.

## Requisitos Técnicos Complementares

- Stack base: Next.js 14 (App Router) + TypeScript + Tailwind + shadcn/ui.
- I18n com roteamento em `app/[locale]/` e mensagens em `i18n/messages/`.
- Supabase configurado conforme `SUPABASE-SETUP.md`, com validação em `lib/config/env.ts`.
- Docker Compose fornecido deve continuar funcional (dev e prod).

## Workflow e Garantia de Qualidade

- Planejamento conduzido por especificações do Spec Kit (spec → plan → tasks → implement).
- Pull requests precisam incluir evidências de testes (manual ou automatizado) e revisão de acessibilidade básica.
- Monitorar regressões com QA checklist do BMAD antes de release.
- Documentar alterações relevantes em README ou arquivos de setup correspondentes.

## Governança

Esta constituição sobrepõe padrões anteriores. Alterações exigem aprovação conjunta de produto/tech lead, registro no changelog do projeto e atualização dos artefatos do Spec Kit. Quebras de princípio devem ter plano de mitigação documentado.

**Version**: 1.0.0 | **Ratificado**: 2025-11-03 | **Última Alteração**: 2025-11-03
