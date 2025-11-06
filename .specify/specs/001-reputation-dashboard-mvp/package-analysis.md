# Análise de Pacotes - nORM MVP

**Data**: 2025-11-06  
**Baseado em**: Context7 e melhores práticas

## 📦 Pacotes Principais Instalados

### Frontend Framework

#### Next.js 14.2.0
- **Status**: ✅ Instalado
- **Uso**: Framework principal (App Router)
- **Versão**: 14.2.0 (atual)
- **Recomendações**:
  - Usar Server Components por padrão
  - Client Components apenas para interatividade
  - Aproveitar Server Actions para mutations
- **Documentação**: https://nextjs.org/docs

#### React 18.3.1
- **Status**: ✅ Instalado
- **Uso**: Biblioteca UI base
- **Versão**: 18.3.1 (atual)
- **Recomendações**:
  - Usar hooks modernos (use, useTransition)
  - Server Components quando possível
- **Documentação**: https://react.dev

#### TypeScript 5.5.0
- **Status**: ✅ Instalado (strict mode)
- **Uso**: Tipagem estática
- **Versão**: 5.5.0 (atual)
- **Recomendações**:
  - Manter strict mode habilitado
  - Usar tipos gerados do Supabase
  - Tipar todas as props e funções
- **Documentação**: https://www.typescriptlang.org/docs

### UI Components & Styling

#### shadcn/ui (via Radix UI)
- **Status**: ✅ Configurado
- **Uso**: Componentes acessíveis
- **Componentes instalados**: Avatar, Checkbox, Dialog, Dropdown, Label, Navigation, Radio, Scroll, Select, Separator, Slot, Switch, Tooltip
- **Recomendações**:
  - Adicionar componentes conforme necessário: `npx shadcn@latest add [component]`
  - Customizar via Tailwind
- **Documentação**: https://ui.shadcn.com

#### Tailwind CSS 3.4.0
- **Status**: ✅ Instalado
- **Uso**: Estilização utilitária
- **Versão**: 3.4.0 (atual)
- **Recomendações**:
  - Usar classes utilitárias
  - Customizar tema em `tailwind.config.ts`
  - Seguir design system ness (cores, espaçamentos)
- **Documentação**: https://tailwindcss.com/docs

#### Recharts 3.3.0
- **Status**: ✅ Instalado
- **Uso**: Gráficos do dashboard (reputation timeline, SERP trends)
- **Versão**: 3.3.0 (atual)
- **Recomendações**:
  - Usar para gráficos de linha (timeline)
  - Gráficos de barras (SERP positions)
  - Responsivo por padrão
- **Documentação**: https://recharts.org

### Backend & Database

#### Supabase (@supabase/ssr 0.7.0, @supabase/supabase-js 2.78.0)
- **Status**: ✅ Instalado
- **Uso**: Backend completo (Auth, Database, Storage, Edge Functions)
- **Versões**: 
  - @supabase/ssr: 0.7.0 (para Next.js App Router)
  - @supabase/supabase-js: 2.78.0
- **Recomendações**:
  - Usar `@supabase/ssr` para Server Components
  - RLS habilitado em todas as tabelas
  - Edge Functions para jobs assíncronos
  - Gerar tipos: `supabase gen types typescript`
- **Documentação**: https://supabase.com/docs
- **Projeto**: hyeifxvxifhrapfdvfry

### AI & APIs

#### OpenAI 6.8.1
- **Status**: ✅ Instalado
- **Uso**: GPT-4 para geração de conteúdo e análise de sentimento
- **Versão**: 6.8.1 (atual)
- **Recomendações**:
  - Usar GPT-4 para conteúdo final
  - GPT-3.5-turbo para rascunhos (economia)
  - Implementar retry logic
  - Monitorar uso de tokens
  - Cache de respostas quando possível
- **Documentação**: https://platform.openai.com/docs
- **Custo estimado**: $120-150/mês

#### Resend 6.4.1
- **Status**: ✅ Instalado
- **Uso**: Envio de emails (alertas, notificações)
- **Versão**: 6.4.1 (atual)
- **Recomendações**:
  - Usar templates React para emails
  - Rate limiting: 3000 emails/mês (free tier)
  - Configurar domínio para produção
- **Documentação**: https://resend.com/docs
- **Custo estimado**: $0-20/mês

### Testing

#### Vitest 4.0.7
- **Status**: ✅ Instalado
- **Uso**: Testes unitários
- **Versão**: 4.0.7 (atual)
- **Recomendações**:
  - 80% coverage target
  - Testar: reputation calculator, sentiment analysis, SERP parsing
  - Usar MSW para mock de APIs
- **Documentação**: https://vitest.dev

#### Playwright 1.56.1
- **Status**: ✅ Instalado
- **Uso**: Testes E2E
- **Versão**: 1.56.1 (atual)
- **Recomendações**:
  - Testar fluxos críticos: signup, generate content, alerts
  - Screenshots em falhas
  - CI/CD integration
- **Documentação**: https://playwright.dev

#### React Testing Library 16.3.0
- **Status**: ✅ Instalado
- **Uso**: Testes de componentes
- **Versão**: 16.3.0 (atual)
- **Recomendações**:
  - Testar comportamento, não implementação
  - Acessibilidade incluída
- **Documentação**: https://testing-library.com/react

#### MSW 2.12.0
- **Status**: ✅ Instalado
- **Uso**: Mock Service Worker para mock de APIs
- **Versão**: 2.12.0 (atual)
- **Recomendações**:
  - Mock de OpenAI, SerpAPI, Social APIs
  - Handlers reutilizáveis
- **Documentação**: https://mswjs.io

### Utilities

#### Zod 4.1.12
- **Status**: ✅ Instalado
- **Uso**: Validação de schemas
- **Versão**: 4.1.12 (atual)
- **Recomendações**:
  - Validar todos os inputs de API
  - Schemas compartilhados entre frontend/backend
  - Type inference automático
- **Documentação**: https://zod.dev

#### Axios 1.13.2
- **Status**: ✅ Instalado
- **Uso**: Cliente HTTP para APIs externas (SerpAPI, Social APIs)
- **Versão**: 1.13.2 (atual)
- **Recomendações**:
  - Interceptors para retry logic
  - Rate limiting
  - Error handling centralizado
- **Documentação**: https://axios-http.com

#### next-intl 4.4.0
- **Status**: ✅ Instalado
- **Uso**: Internacionalização (PT-BR, EN, ES)
- **Versão**: 4.4.0 (atual)
- **Recomendações**:
  - PT-BR como padrão no MVP
  - Mensagens em `i18n/messages/`
  - Server Components compatível
- **Documentação**: https://next-intl-docs.vercel.app

### Pacotes Faltando (Precisam Instalação)

#### SerpAPI
- **Status**: ❌ Não instalado (API REST, não precisa pacote npm)
- **Uso**: Tracking de posições no Google
- **Recomendação**: Usar Axios para chamadas HTTP
- **API**: https://serpapi.com/google-search-api
- **Custo estimado**: $80-100/mês

#### Meta Graph API (Instagram/Facebook)
- **Status**: ❌ Não instalado (API REST)
- **Uso**: Monitoramento de redes sociais
- **Recomendação**: Usar Axios + OAuth flow
- **API**: https://developers.facebook.com/docs/graph-api
- **Custo**: Grátis (com rate limits)

#### LinkedIn API
- **Status**: ❌ Não instalado (API REST)
- **Uso**: Monitoramento do LinkedIn
- **Recomendação**: Usar Axios + OAuth 2.0
- **API**: https://learn.microsoft.com/en-us/linkedin/
- **Custo**: Grátis (com rate limits)

#### WordPress REST API
- **Status**: ❌ Não instalado (API REST)
- **Uso**: Publicação automática de artigos
- **Recomendação**: Usar Axios + Application Passwords
- **API**: https://developer.wordpress.org/rest-api/
- **Custo**: Grátis

## 📊 Resumo de Dependências

### Produção (dependencies)
- ✅ Next.js 14.2.0
- ✅ React 18.3.1
- ✅ TypeScript 5.5.0
- ✅ Supabase (ssr + js)
- ✅ OpenAI 6.8.1
- ✅ Resend 6.4.1
- ✅ Zod 4.1.12
- ✅ Axios 1.13.2
- ✅ Recharts 3.3.0
- ✅ next-intl 4.4.0
- ✅ Radix UI components
- ✅ Tailwind CSS utilities

### Desenvolvimento (devDependencies)
- ✅ Vitest 4.0.7
- ✅ Playwright 1.56.1
- ✅ React Testing Library 16.3.0
- ✅ MSW 2.12.0
- ✅ ESLint + Next.js config

## 🔍 Análise de Compatibilidade

### ✅ Todas as versões são compatíveis
- Next.js 14 + React 18: ✅ Compatível
- TypeScript 5.5 + Next.js 14: ✅ Compatível
- Supabase SSR 0.7.0 + Next.js 14: ✅ Compatível
- Vitest 4.0 + TypeScript 5.5: ✅ Compatível
- Playwright 1.56 + Next.js 14: ✅ Compatível

## 💰 Estimativa de Custos (APIs Externas)

- **OpenAI**: $120-150/mês
- **SerpAPI**: $80-100/mês
- **Resend**: $0-20/mês
- **Supabase Pro**: $25/mês
- **Vercel Pro**: $20/mês
- **Total**: $245-315/mês (dentro do orçamento de $345-545/mês)

## 🚀 Próximos Passos

1. ✅ Dependências principais instaladas
2. ⏭️ Criar clientes HTTP para APIs externas (SerpAPI, Social APIs)
3. ⏭️ Configurar variáveis de ambiente
4. ⏭️ Setup de testes (Vitest config, Playwright config)
5. ⏭️ Gerar tipos do Supabase

## 📚 Referências

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [OpenAI API Reference](https://platform.openai.com/docs)
- [Vitest Documentation](https://vitest.dev)
- [Playwright Documentation](https://playwright.dev)

