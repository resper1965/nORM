# Ness Theme Application Specification

## Visão Geral
Baseado no template `ness-theme`, este projeto entrega um dashboard SaaS multilíngue construido com Next.js 14, Tailwind e shadcn/ui. O objetivo é acelerar novos produtos fornecendo layout, componentes, autenticação por Supabase e infraestrutura Docker pronta.

## Objetivos do Produto
- Fornecer experiência administrativa moderna (analytics, calendário, documentos, pricing, configurações, equipe, e-mail) pronta para ajustes mínimos.
- Garantir suporte imediato a português, inglês e espanhol através do roteamento `app/[locale]/`.
- Facilitar integração rápida com Supabase para autenticação, persistência e edge middleware.
- Oferecer documentação clara (README, setup Supabase, Docker) para onboarding rápido de times.

## Personas Principais
- **Founder/PM**: Precisa validar funcionalidades rapidamente usando um dashboard coeso.
- **Desenvolvedor Fullstack**: Espera base consistente de componentes e estrutura i18n para evoluir features.
- **Analista/Equipe Operacional**: Consome dashboards, relatórios e páginas de configuração em múltiplos idiomas.

## Cenários de Uso Prioritários
1. **Acesso ao Dashboard**: Usuário autenticado abre `/[locale]/` e visualiza métricas, vendas recentes e navegação lateral.
2. **Gestão de Equipe**: Administrador visualiza e edita membros em `/[locale]/team`.
3. **Configuração do Sistema**: Usuário ajusta preferências em `/[locale]/settings`, incluindo temas claro/escuro.
4. **Consumo de Conteúdo**: Usuários consultam módulos de documentos, calendário, pricing e mail, mantendo consistência de UI.

## Escopo Funcional Atual
- Navegação principal via sidebar (`components/dashboard/sidebar.tsx`) e header com troca de tema e idioma.
- Páginas pré-montadas em `app/[locale]/` para analytics, calendar, documents, mail, pricing, settings, team.
- Componentes reutilizáveis (cards, tabelas, inputs, dropdowns, gráficos com Recharts).
- Estado de carregamento global (`app/[locale]/loading.tsx`), erro (`error.tsx`) e página 404 (`not-found.tsx`).
- Integração com Supabase (`lib/supabase/*`) e validação de ambientes (`lib/config/env.ts`).

## Requisitos Não Funcionais
- Desempenho: páginas principais devem carregar em < 2s em desktop, com skeletons enquanto dados remotos carregam.
- Acessibilidade: componentes shadcn/ui configurados com foco e contrastes adequados; suporte completo a teclado.
- Confiabilidade: tratamento de erros via `AppError`, fallback UI amigável e logs estruturados.
- Internacionalização: traduções gerenciadas via `next-intl`, com fallback para português.
- Observabilidade: logs enviados para console/monitoramento e rastreio de erros críticos.

## Restrições
- Manter estrutura do App Router com diretórios por locale.
- Utilizar Tailwind + variáveis de tema definidas em `app/[locale]/globals.css`.
- Evitar dependências não aprovadas sem atualização do `CRITICAS-E-MELHORIAS.md`.
- Supabase como backend padrão; outras integrações precisam de drivers adaptadores.

## Itens Fora de Escopo Inicial
- Backoffice avançado com workflows customizados além das páginas existentes.
- Automação de e-mail transacional (apenas interfaces mockadas).
- Dashboard analytics com dados em tempo real (atualmente dados estáticos/dummy).

## Dependências e Integrações
- Supabase (auth, banco de dados) via chaves configuradas em variáveis de ambiente.
- Docker/Docker Compose para desenvolvimento e deploy.
- BMAD Method para governança e checklists de qualidade.
- Especificações do Spec Kit para planejamento contínuo (constitution, plan, tasks, implement).

## Riscos & Mitigações
- **Falta de dados reais** → expor mocks e documentar substituição por chamadas Supabase.
- **Complexidade de i18n** → centralizar traduções em `i18n/messages/*.json` e incluir testes manuais a cada feature.
- **Dependência de Supabase** → validar chaves em build e fornecer documentação de fallback.

## Métricas de Sucesso
- Tempo médio para lançar nova feature < 1 semana usando o template.
- Bugs críticos em produção reduzidos graças a checklists BMAD e logging centralizado.
- Adoção do tema Ness em 100% das novas páginas, sem divergências de identidade visual.
