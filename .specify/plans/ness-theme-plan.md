# Ness Theme Implementation Plan

## Visão Arquitetural
- **Frontend**: Next.js 14 com App Router, React Server Components e rendering híbrido; Tailwind + shadcn/ui para UI; Recharts para gráficos.
- **Internacionalização**: `next-intl` com middleware em `middleware.ts` permitindo fallback para pt e rotas `/[locale]/`.
- **Autenticação/Dados**: Supabase via clientes em `lib/supabase/` (browser, server e middleware) e validação de env `lib/config/env.ts`.
- **Infraestrutura**: Docker Compose para desenvolvimento (`docker-compose.yml`) e produção (`docker-compose.prod.yml`); scripts BMAD para setup/updates.
- **Observabilidade**: Logger utilitário em `lib/utils/logger.ts` e classes de erro em `lib/errors/app-error.ts`; expandir para provedores externos se necessário.

## Divisão por Camadas
1. **UI & Componentes**
   - Garantir que componentes shadcn/custom (`components/ui`, `components/dashboard`) permanecem desacoplados de dados.
   - Apoiar estados de carregamento e erro com skeletons e boundary existentes.
2. **Fluxos de Página**
   - Cada rota em `app/[locale]/` deve consumir traduções e dados via server components ou `suspense`.
   - Expandir dados mockados para integrações reais com Supabase gradualmente.
3. **Serviços & Integrations**
   - Reutilizar clientes Supabase, adicionar hooks específicos em `lib/hooks/` se necessário.
   - Centralizar validações em `lib/utils/validation.ts` (com Zod) para formulários.
4. **Config & DevEx**
   - Scripts do Spec Kit (`.specify/scripts/bash/*.sh`) serão usados para atualizar contexto e gerar planejamento.
   - Manter checklists BMAD como parte do pipeline CI (`npm run bmad:check`).

## Roadmap de Entrega
- **Milestone 1 – Fundamentos Spec-Driven**
  - Ratificar constituição e revisar documentação existente.
  - Converter especificação inicial (`ness-theme-spec`) em backlog no `/speckit.tasks`.
- **Milestone 2 – Conectar Supabase**
  - Substituir mocks por consultas reais nas páginas principais.
  - Configurar segurança (RLS, policies) e validar envs.
- **Milestone 3 – Personalizações do Produto**
  - Ajustar identidade visual conforme cliente (tokens no `theme.ts`).
  - Criar novos módulos/páginas seguindo o padrão `[locale]`.
- **Milestone 4 – Qualidade & Deploy**
  - Adicionar testes (Vitest/React Testing Library) e cenários E2E conforme necessário.
  - Automatizar build/teste em CI e preparar imagem Docker para produção.

## Decisões Técnicas Chave
- Usar componentes server-first sempre que possível para reduzir bundles.
- Persistir configurações de usuário no Supabase; evitar estado global complexo sem necessidade.
- Preferir validações com Zod tanto em env quanto em formulários para consistência.
- Estrutura de pastas deve permanecer alinhada ao template; novas features seguem padrão `components/<domínio>`.

## Matriz de Riscos
- **Integração Supabase incompleta** → Planos de rollback via mocks + feature toggles locais.
- **Divergência de estilos** → Auditoria semanal com tokens de design e Storybook opcional.
- **Falta de testes** → Definir meta mínima: 70% das páginas com smoke test + lint obrigatório.
- **Complexidade de internacionalização** → Processos de revisão das strings a cada PR, fallback garantido.

## Checklist de Prontidão
- [ ] Constituição ratificada e versionada.
- [ ] Especificação validada com stakeholders.
- [ ] Plano de implementação revisado por arquitetos/lead dev.
- [ ] Tasks derivadas e priorizadas.
- [ ] Variáveis de ambiente definidas e validadas.
- [ ] Pipelines CI/CD preparados para lint/build/test.

## Observações
- Scripts bash do Spec Kit exigem permissão de execução (`chmod +x`).
- Atualizações de documentação devem replicar instruções em README/SUPABASE/DOCKER para manter coesão.
- Registrar mudanças estratégicas no `CHANGELOG` futuro e em artefatos Spec Kit.
