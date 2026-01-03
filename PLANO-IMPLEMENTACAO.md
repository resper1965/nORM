# 🎯 Plano de Implementação - nORM
## Criação das Partes Faltantes

> **Status Atual**: ~50% Completo
> **Objetivo**: MVP Funcional (100%)
> **Estimativa**: 8-12 semanas de desenvolvimento

---

## 📊 Visão Geral

### Status Atual
- ✅ Infraestrutura: 90% (Supabase, Next.js, UI components)
- ⚠️ Funcionalidades Core: 40% (estruturas criadas, lógica faltando)
- ⚠️ Integrações Externas: 20% (apenas estrutura)
- ✅ UI/UX: 70% (componentes básicos prontos)

### Arquivos com TODOs Identificados
```
13 arquivos com implementações pendentes:
- app/api/cron/* (4 arquivos)
- lib/reputation/* (2 arquivos)
- lib/social/* (4 arquivos)
- lib/scraping/serp-tracker.ts
- lib/wordpress/publisher.ts
- lib/utils/logger.ts
```

---

## 🏗️ FASE 1: Fundação e Preparação (Semana 1)

### Objetivo
Preparar ambiente e garantir que toda infraestrutura básica funcione.

### Tarefas

#### 1.1 Setup Inicial
```bash
# Prioridade: CRÍTICA
# Tempo estimado: 2-4 horas
```

- [ ] **T1.1.1** Instalar dependências do projeto
  ```bash
  npm install
  ```

- [ ] **T1.1.2** Validar variáveis de ambiente
  - Arquivo: `lib/config/env.ts`
  - Verificar todas as variáveis necessárias
  - Implementar validação com Zod

- [ ] **T1.1.3** Testar conexão com Supabase
  - Verificar migrations aplicadas (7 migrations)
  - Testar queries básicas
  - Validar RLS policies

- [ ] **T1.1.4** Testar servidor local
  ```bash
  npm run dev
  ```
  - Verificar se inicia sem erros
  - Testar rotas básicas
  - Validar autenticação

#### 1.2 Melhorias de Infraestrutura
```bash
# Prioridade: ALTA
# Tempo estimado: 8-12 horas
```

- [ ] **T1.2.1** Implementar sistema de logging estruturado
  - Arquivo: `lib/utils/logger.ts`
  - Remover TODOs (linha 48)
  - Integrar com serviço (Sentry ou similar)
  - Adicionar níveis de log (info, warn, error, debug)

- [ ] **T1.2.2** Implementar validação de CRON_SECRET
  - Arquivos: `app/api/cron/*/route.ts` (4 arquivos)
  - Remover TODOs (linha 14/15)
  - Adicionar verificação de authorization
  - Prevenir acessos não autorizados

- [ ] **T1.2.3** Criar error boundaries e handlers
  - Verificar `app/[locale]/error.tsx` funciona
  - Adicionar logging de erros
  - Testar recovery

**Checkpoint 1.0**: Infraestrutura básica funcionando ✅

---

## 🔴 FASE 2: Funcionalidades Core Críticas (Semanas 2-4)

### Objetivo
Implementar as 4 funcionalidades que bloqueiam o MVP.

---

### 2.1 Cálculo de Score de Reputação

```bash
# Prioridade: CRÍTICA (Bloqueia MVP)
# Tempo estimado: 16-24 horas
# Arquivo principal: lib/reputation/calculator.ts
```

#### Contexto
- Estrutura criada, cálculo mock na linha 40
- TODO: "Implement actual calculation using Supabase queries"
- Depende de: dados SERP, social mentions, news

#### Tarefas

- [ ] **T2.1.1** Implementar query para dados SERP
  ```typescript
  // Buscar posições SERP dos últimos 30 dias
  // Calcular média de posições
  // Identificar conteúdo do cliente vs terceiros
  ```

- [ ] **T2.1.2** Implementar query para sentimento de menções
  ```typescript
  // Buscar menções sociais dos últimos 30 dias
  // Calcular distribuição (positivo/neutro/negativo)
  // Calcular volume de menções
  ```

- [ ] **T2.1.3** Implementar query para notícias
  ```typescript
  // Buscar news mentions dos últimos 30 dias
  // Calcular sentimento médio
  // Ponderar por relevância
  ```

- [ ] **T2.1.4** Implementar fórmula de cálculo
  ```typescript
  // Score = (SERP * 0.4) + (Social * 0.3) + (News * 0.2) + (Trend * 0.1)
  // SERP: baseado em posições (top 3 = 100, página 2 = 50, etc)
  // Social: baseado em sentimento e volume
  // News: baseado em sentimento de notícias
  // Trend: comparação com período anterior
  ```

- [ ] **T2.1.5** Implementar breakdown detalhado
  ```typescript
  interface ScoreBreakdown {
    serp_score: number;        // 0-100
    news_score: number;        // 0-100
    social_score: number;      // 0-100
    trend_score: number;       // -100 a +100
    volume_score: number;      // 0-100
  }
  ```

- [ ] **T2.1.6** Implementar comparação temporal (trend)
  ```typescript
  // Comparar score atual com período anterior (30 dias)
  // Calcular delta e percentual de mudança
  ```

- [ ] **T2.1.7** Criar testes unitários
  - Testar cálculos com dados mock
  - Validar fórmulas
  - Testar edge cases

**Entregas**:
- ✅ Função `calculateReputationScore()` funcional
- ✅ Breakdown detalhado por categoria
- ✅ Tendência calculada
- ✅ Testes passando

---

### 2.2 Geração de Alertas

```bash
# Prioridade: CRÍTICA (Bloqueia MVP)
# Tempo estimado: 12-16 horas
# Arquivo principal: lib/reputation/alert-generator.ts
```

#### Contexto
- Estrutura criada na linha 24
- TODO: "Implement actual alert generation logic"
- Depende de: cálculo de score (2.1)

#### Tarefas

- [ ] **T2.2.1** Implementar detecção de quedas de score
  ```typescript
  // Detectar queda > 5 pontos = WARNING
  // Detectar queda > 10 pontos = CRITICAL
  ```

- [ ] **T2.2.2** Implementar detecção de conteúdo negativo SERP
  ```typescript
  // Detectar conteúdo negativo na página 1-2
  // Verificar se é novo (não existia antes)
  // Criar alerta com URL e posição
  ```

- [ ] **T2.2.3** Implementar detecção de mudanças SERP
  ```typescript
  // Detectar mudança de posição > 3 lugares
  // Detectar saída do top 10
  // Detectar entrada de conteúdo negativo
  ```

- [ ] **T2.2.4** Implementar detecção de menções sociais negativas
  ```typescript
  // Detectar menções com sentimento < -0.5
  // Detectar volume anormal de menções negativas
  // Agrupar menções relacionadas
  ```

- [ ] **T2.2.5** Implementar regras de severidade
  ```typescript
  type Severity = 'low' | 'medium' | 'high' | 'critical';

  // CRITICAL: Score drop >10, conteúdo negativo no top 3
  // HIGH: Score drop 5-10, conteúdo negativo no top 10
  // MEDIUM: Mudanças SERP significativas
  // LOW: Menções negativas isoladas
  ```

- [ ] **T2.2.6** Implementar deduplicação de alertas
  ```typescript
  // Evitar alertas duplicados para mesma situação
  // Agrupar alertas relacionados
  // Atualizar alertas existentes
  ```

- [ ] **T2.2.7** Integrar com cron job
  - Arquivo: `app/api/cron/calculate-reputation/route.ts`
  - Chamar geração de alertas após calcular score
  - Salvar alertas no banco

- [ ] **T2.2.8** Criar testes
  - Testar cada tipo de detecção
  - Testar severidades
  - Testar deduplicação

**Entregas**:
- ✅ Sistema de alertas funcional
- ✅ 4 tipos de alertas implementados
- ✅ Severidade correta
- ✅ Deduplicação funcionando

---

### 2.3 Envio Automático de E-mails

```bash
# Prioridade: CRÍTICA (Bloqueia MVP)
# Tempo estimado: 8-12 horas
# Arquivo principal: lib/notifications/email.ts
```

#### Contexto
- Função `sendAlertEmail()` já existe e funciona
- Falta: integração automática e gestão de destinatários
- Ver: `ONDE-ENVIA-EMAILS.md`

#### Tarefas

- [ ] **T2.3.1** Criar função para obter destinatários
  ```typescript
  // Buscar usuários admin/editor do cliente
  // Filtrar por preferências de notificação
  // Retornar lista de emails
  ```

- [ ] **T2.3.2** Integrar envio ao criar alertas HIGH/CRITICAL
  ```typescript
  // Em alert-generator.ts
  // Ao criar alerta HIGH ou CRITICAL
  // Chamar sendAlertEmail() automaticamente
  ```

- [ ] **T2.3.3** Criar tabela de preferências de notificação
  ```sql
  CREATE TABLE notification_preferences (
    user_id UUID REFERENCES users,
    alert_severity TEXT[], -- quais severidades enviar
    email_enabled BOOLEAN DEFAULT true,
    frequency TEXT DEFAULT 'immediate' -- immediate, daily, weekly
  );
  ```

- [ ] **T2.3.4** Implementar agrupamento de e-mails
  ```typescript
  // Para frequency = 'daily', agrupar alertas
  // Enviar digest diário ao invés de múltiplos emails
  ```

- [ ] **T2.3.5** Criar cron job para e-mails pendentes
  ```typescript
  // app/api/cron/send-emails/route.ts
  // Enviar e-mails agrupados diariamente
  // Marcar como enviados
  ```

- [ ] **T2.3.6** Atualizar campo email_sent após envio
  ```typescript
  // Em alerts table
  // Marcar email_sent = true
  // Registrar timestamp
  ```

- [ ] **T2.3.7** Criar página de preferências de notificação
  ```typescript
  // app/[locale]/(dashboard)/settings/notifications/page.tsx
  // Permitir usuário configurar preferências
  ```

- [ ] **T2.3.8** Testar envio de e-mails
  - Testar envio imediato
  - Testar agrupamento diário
  - Testar preferências

**Entregas**:
- ✅ E-mails enviados automaticamente
- ✅ Preferências de usuário respeitadas
- ✅ Agrupamento diário funcional
- ✅ Cron job configurado

---

### 2.4 Geração de Conteúdo com IA

```bash
# Prioridade: CRÍTICA (Bloqueia MVP)
# Tempo estimado: 20-28 horas
# Arquivo principal: app/api/generate-content/route.ts
```

#### Contexto
- Estrutura criada na linha 52
- TODO: "Implement actual content generation"
- Mais complexa das 4 funcionalidades críticas

#### Tarefas

- [ ] **T2.4.1** Implementar chamada para OpenAI
  ```typescript
  // Usar GPT-4 ou GPT-4-turbo
  // Configurar temperatura, max_tokens
  // Implementar retry logic
  ```

- [ ] **T2.4.2** Criar prompts de geração
  ```typescript
  // Prompt para artigo positivo
  // Prompt para análise de keyword
  // Prompt para meta description
  // Incluir contexto do cliente
  ```

- [ ] **T2.4.3** Implementar geração de múltiplos artigos (3-5)
  ```typescript
  // Gerar 3-5 artigos com ângulos diferentes
  // Cada artigo 800-1500 palavras
  // Garantir unicidade (>70% diferença)
  ```

- [ ] **T2.4.4** Implementar análise SEO
  ```typescript
  // Calcular SEO score (0-100)
  // Verificar: keyword density, readability, structure
  // Sugerir melhorias
  ```

- [ ] **T2.4.5** Implementar validação de qualidade
  ```typescript
  // Verificar comprimento mínimo
  // Verificar estrutura (H1, H2, parágrafos)
  // Verificar densidade de keywords
  // Validar idioma (PT-BR)
  ```

- [ ] **T2.4.6** Salvar conteúdo no banco
  ```typescript
  // Tabela: generated_content
  // Incluir: title, content, seo_score, client_id, keyword
  // Status: draft
  ```

- [ ] **T2.4.7** Criar componente de preview
  ```typescript
  // components/content/article-preview.tsx
  // Mostrar como ficará no Google
  // Preview de meta tags
  ```

- [ ] **T2.4.8** Implementar editor de conteúdo
  ```typescript
  // components/content/content-editor.tsx
  // Permitir editar artigos gerados
  // Salvar rascunhos
  // Re-calcular SEO score ao editar
  ```

- [ ] **T2.4.9** Criar página de geração
  ```typescript
  // app/[locale]/(dashboard)/content/generate/page.tsx
  // Form: keyword, client, número de artigos
  // Loading state durante geração
  // Mostrar resultados
  ```

- [ ] **T2.4.10** Implementar limite de rate
  ```typescript
  // Limitar gerações por cliente/mês
  // Prevenir abuso da API OpenAI
  // Mostrar limite restante
  ```

- [ ] **T2.4.11** Testar geração
  - Testar com diferentes keywords
  - Validar qualidade dos artigos
  - Testar SEO score
  - Validar salvamento

**Entregas**:
- ✅ Geração de 3-5 artigos funcionando
- ✅ SEO score calculado
- ✅ Conteúdo salvo no banco
- ✅ Editor funcional
- ✅ Preview implementado

**Checkpoint 2.0**: Funcionalidades Core Críticas implementadas ✅

---

## 🟡 FASE 3: Integrações Externas (Semanas 5-7)

### Objetivo
Implementar integrações com APIs externas para dados reais.

---

### 3.1 Scraping de Notícias (Google News)

```bash
# Prioridade: ALTA
# Tempo estimado: 12-16 horas
# Arquivo principal: app/api/cron/scrape-news/route.ts
```

#### Tarefas

- [ ] **T3.1.1** Implementar scraping Google News RSS
  ```typescript
  // Buscar RSS feed para keywords do cliente
  // Parsear XML
  // Extrair: title, description, URL, publishedAt
  ```

- [ ] **T3.1.2** Implementar análise de sentimento
  ```typescript
  // Usar OpenAI para analisar sentimento
  // Score: -1 (negativo) a +1 (positivo)
  // Categorizar: negative, neutral, positive
  ```

- [ ] **T3.1.3** Detectar menções ao cliente
  ```typescript
  // Verificar se notícia menciona cliente
  // Extrair contexto da menção
  // Classificar relevância
  ```

- [ ] **T3.1.4** Salvar no banco
  ```typescript
  // Tabela: news_mentions
  // Evitar duplicatas
  // Atualizar se URL já existe
  ```

- [ ] **T3.1.5** Criar cron job
  - Executar a cada 6 horas
  - Processar todos os clientes ativos
  - Logging de erros

**Entregas**:
- ✅ Scraping funcionando
- ✅ Sentimento analisado
- ✅ Dados salvos
- ✅ Cron configurado

---

### 3.2 Integração Instagram

```bash
# Prioridade: ALTA
# Tempo estimado: 16-20 horas
# Arquivo principal: lib/social/instagram.ts
```

#### Tarefas

- [ ] **T3.2.1** Configurar Instagram Graph API
  - Criar app no Facebook Developers
  - Obter access tokens
  - Configurar webhooks

- [ ] **T3.2.2** Implementar busca de menções
  ```typescript
  // Buscar posts que mencionam cliente
  // Buscar hashtags relacionadas
  // Obter comentários
  ```

- [ ] **T3.2.3** Implementar captura de stories
  ```typescript
  // Detectar menções em stories
  // Capturar screenshot (se possível)
  // Salvar metadata
  ```

- [ ] **T3.2.4** Calcular métricas de engajamento
  ```typescript
  // Likes, comments, shares
  // Engagement rate
  // Reach estimado
  ```

- [ ] **T3.2.5** Salvar no banco
  ```typescript
  // Tabela: social_posts
  // Platform: 'instagram'
  // Incluir todas as métricas
  ```

**Entregas**:
- ✅ API integrada
- ✅ Menções detectadas
- ✅ Métricas calculadas
- ✅ Dados salvos

---

### 3.3 Integração LinkedIn

```bash
# Prioridade: ALTA
# Tempo estimado: 16-20 horas
# Arquivo principal: lib/social/linkedin.ts
```

#### Tarefas

- [ ] **T3.3.1** Configurar LinkedIn API v2
  - Criar app no LinkedIn Developers
  - Obter OAuth tokens
  - Configurar permissões

- [ ] **T3.3.2** Implementar busca de posts
  ```typescript
  // Buscar posts da company page
  // Buscar menções em posts de terceiros
  // Obter comentários
  ```

- [ ] **T3.3.3** Calcular métricas profissionais
  ```typescript
  // Impressions, clicks, engagement
  // Perfil de audiência (job titles, industries)
  // Lead generation metrics
  ```

- [ ] **T3.3.4** Salvar no banco
  ```typescript
  // Tabela: social_posts
  // Platform: 'linkedin'
  ```

**Entregas**:
- ✅ API integrada
- ✅ Posts monitorados
- ✅ Métricas profissionais
- ✅ Dados salvos

---

### 3.4 Integração Facebook

```bash
# Prioridade: MÉDIA
# Tempo estimado: 12-16 horas
# Arquivo principal: lib/social/facebook.ts
```

#### Tarefas

- [ ] **T3.4.1** Configurar Facebook Graph API
- [ ] **T3.4.2** Implementar busca de posts e comentários
- [ ] **T3.4.3** Implementar busca de reviews
- [ ] **T3.4.4** Calcular métricas
- [ ] **T3.4.5** Salvar no banco

**Entregas**:
- ✅ API integrada
- ✅ Posts e reviews monitorados

---

### 3.5 Feed Unificado de Redes Sociais

```bash
# Prioridade: MÉDIA
# Tempo estimado: 8-12 horas
# Arquivo principal: lib/social/unified-feed.ts
```

#### Tarefas

- [ ] **T3.5.1** Implementar sincronização de todas as plataformas
  ```typescript
  // Chamar Instagram, LinkedIn, Facebook
  // Processar em paralelo
  // Consolidar resultados
  ```

- [ ] **T3.5.2** Implementar agregação e ordenação
  ```typescript
  // Buscar de todas as plataformas
  // Ordenar por data
  // Paginar resultados
  ```

- [ ] **T3.5.3** Implementar filtros
  ```typescript
  // Filtrar por: platform, sentiment, date range, client
  // Otimizar queries
  ```

- [ ] **T3.5.4** Criar componente de feed
  ```typescript
  // components/social/unified-feed.tsx
  // Mostrar posts de todas as plataformas
  // Filtros interativos
  ```

**Entregas**:
- ✅ Feed unificado funcional
- ✅ Filtros implementados
- ✅ Performance otimizada

---

### 3.6 Cron Job de Sincronização Social

```bash
# Prioridade: ALTA
# Tempo estimado: 6-8 horas
# Arquivo principal: app/api/cron/sync-social/route.ts
```

#### Tarefas

- [ ] **T3.6.1** Implementar sincronização automática
  ```typescript
  // Chamar unified-feed.syncAllPlatforms()
  // Para cada cliente ativo
  // A cada 1 hora
  ```

- [ ] **T3.6.2** Implementar retry logic
- [ ] **T3.6.3** Implementar rate limiting
- [ ] **T3.6.4** Configurar Vercel Cron

**Entregas**:
- ✅ Sincronização automática funcionando
- ✅ Cron configurado

**Checkpoint 3.0**: Integrações Externas implementadas ✅

---

## 🟢 FASE 4: Melhorias e Refinamento (Semana 8)

### Objetivo
Implementar features secundárias e melhorias de qualidade.

---

### 4.1 Publicação Automática WordPress

```bash
# Prioridade: MÉDIA
# Tempo estimado: 8-12 horas
# Arquivo principal: lib/wordpress/publisher.ts
```

#### Tarefas

- [ ] **T4.1.1** Implementar criptografia de senhas
  ```typescript
  // Linha 28: TODO decrypt password
  // Usar crypto para encrypt/decrypt
  // Chave armazenada em env var
  ```

- [ ] **T4.1.2** Criar API endpoint de configuração WordPress
  ```typescript
  // app/api/wordpress/sites/route.ts
  // CRUD de sites WordPress
  ```

- [ ] **T4.1.3** Criar interface de configuração
  ```typescript
  // app/[locale]/(dashboard)/settings/wordpress/page.tsx
  // Form para adicionar sites
  // Testar conexão
  ```

- [ ] **T4.1.4** Implementar publicação automática como draft
  ```typescript
  // Modificar publishToWordPress()
  // Sempre publicar como 'draft' inicialmente
  ```

**Entregas**:
- ✅ Senhas criptografadas
- ✅ Interface de configuração
- ✅ Publicação como draft

---

### 4.2 Detecção de Conteúdo do Cliente

```bash
# Prioridade: MÉDIA
# Tempo estimado: 4-6 horas
# Arquivo principal: lib/scraping/serp-tracker.ts
```

#### Tarefas

- [ ] **T4.2.1** Implementar detecção de domínio
  ```typescript
  // Linha 39: is_client_content sempre false
  // Comparar URL com domínios do cliente
  // Marcar corretamente
  ```

- [ ] **T4.2.2** Criar tabela de domínios do cliente
  ```sql
  CREATE TABLE client_domains (
    client_id UUID REFERENCES clients,
    domain TEXT NOT NULL,
    verified BOOLEAN DEFAULT false
  );
  ```

- [ ] **T4.2.3** Usar em cálculo de score
  ```typescript
  // Dar peso maior para conteúdo do cliente
  // Diferenciar conteúdo próprio vs terceiros
  ```

**Entregas**:
- ✅ Detecção funcionando
- ✅ Usada em cálculos

---

### 4.3 Páginas Faltantes

```bash
# Prioridade: MÉDIA
# Tempo estimado: 12-16 horas
```

#### Tarefas

- [ ] **T4.3.1** Criar página de alertas detalhada
  ```typescript
  // app/[locale]/(dashboard)/reputation/alerts/page.tsx
  // Lista completa de alertas
  // Filtros: severity, type, status, date
  // Ações: mark as resolved, dismiss
  ```

- [ ] **T4.3.2** Criar página de configurações de notificações
  ```typescript
  // app/[locale]/(dashboard)/settings/notifications/page.tsx
  // Preferências de e-mail
  // Tipos de alertas
  // Frequência
  ```

- [ ] **T4.3.3** Criar componente de análise SEO
  ```typescript
  // components/content/seo-score-panel.tsx
  // Breakdown do score
  // Sugestões de melhoria
  // Comparação com concorrentes
  ```

**Entregas**:
- ✅ 3 páginas criadas e funcionais

---

### 4.4 Testes

```bash
# Prioridade: ALTA
# Tempo estimado: 16-24 horas
```

#### Tarefas

- [ ] **T4.4.1** Testes unitários para cálculo de score
  ```typescript
  // tests/unit/reputation/calculator.test.ts
  // Testar fórmulas
  // Testar edge cases
  ```

- [ ] **T4.4.2** Testes de integração para APIs externas
  ```typescript
  // tests/integration/social/*.test.ts
  // Mock de APIs
  // Testar fluxos completos
  ```

- [ ] **T4.4.3** Testes E2E para fluxo completo
  ```typescript
  // tests/e2e/reputation-flow.spec.ts
  // Testar: detectar crise → gerar alerta → enviar email
  ```

- [ ] **T4.4.4** Testes de carga para cron jobs
  ```typescript
  // Testar com múltiplos clientes
  // Verificar rate limits
  // Testar resilience
  ```

**Entregas**:
- ✅ Coverage > 70%
- ✅ Testes passando
- ✅ CI configurado

**Checkpoint 4.0**: MVP Completo e Testado ✅

---

## 📋 Resumo de Entregas por Fase

### FASE 1: Fundação (Semana 1)
- ✅ Ambiente de desenvolvimento funcionando
- ✅ Infraestrutura robusta (logging, auth, error handling)
- ✅ Pronto para desenvolvimento

### FASE 2: Core Crítico (Semanas 2-4)
- ✅ Cálculo de score de reputação
- ✅ Sistema de alertas
- ✅ Envio automático de e-mails
- ✅ Geração de conteúdo com IA

### FASE 3: Integrações (Semanas 5-7)
- ✅ Scraping de notícias
- ✅ Instagram integrado
- ✅ LinkedIn integrado
- ✅ Facebook integrado
- ✅ Feed unificado

### FASE 4: Refinamento (Semana 8)
- ✅ WordPress auto-publish
- ✅ Detecção de conteúdo
- ✅ Páginas faltantes
- ✅ Testes completos

---

## 🎯 Ordem de Execução Recomendada

### Semana 1
1. T1.1: Setup Inicial (prioridade máxima)
2. T1.2: Melhorias de Infraestrutura

### Semana 2
3. T2.1: Cálculo de Score (fundação para todo resto)

### Semana 3
4. T2.2: Geração de Alertas (depende de 2.1)
5. T2.3: Envio de E-mails (depende de 2.2)

### Semana 4
6. T2.4: Geração de Conteúdo (independente, pode ser paralelo)

### Semana 5
7. T3.1: Scraping de Notícias (alimenta score)
8. T3.6: Cron Sync Social (setup inicial)

### Semana 6
9. T3.2: Instagram (prioridade: mais usado no Brasil)

### Semana 7
10. T3.3: LinkedIn (corporativo, importante)
11. T3.4: Facebook (complementar)
12. T3.5: Feed Unificado

### Semana 8
13. T4.1: WordPress
14. T4.2: Detecção de Conteúdo
15. T4.3: Páginas Faltantes
16. T4.4: Testes

---

## 📊 Métricas de Sucesso

### Funcionalidade
- [ ] Todos os 13 arquivos com TODO implementados
- [ ] Todas as 97 tarefas do tasks.md concluídas
- [ ] 0 TODOs restantes no código

### Qualidade
- [ ] Cobertura de testes > 70%
- [ ] 0 bugs críticos
- [ ] Performance adequada (< 3s para calcular score)

### Documentação
- [ ] README atualizado
- [ ] API documentada
- [ ] Guias de deployment completos

---

## 🚀 Próximos Passos

### Imediatos (Hoje)
1. Instalar dependências: `npm install`
2. Testar servidor: `npm run dev`
3. Validar conexão Supabase

### Esta Semana (Semana 1)
4. Completar FASE 1 completa
5. Preparar ambiente para desenvolvimento

### Próximas 2 Semanas (Semanas 2-3)
6. Implementar funcionalidades críticas (FASE 2)
7. Ter MVP básico funcionando

### Mês 2 (Semanas 5-8)
8. Integrações externas (FASE 3)
9. Refinamento e testes (FASE 4)
10. Deploy e lançamento

---

## 💡 Notas Importantes

### Dependências Críticas
- T2.1 (Score) → T2.2 (Alertas) → T2.3 (E-mails)
- Esta cadeia DEVE ser feita em ordem

### Tarefas Paralelas
- T2.4 (Conteúdo) pode ser feito em paralelo com T2.2/T2.3
- Todas as integrações sociais (T3.2-T3.4) podem ser paralelas
- FASE 4 inteira pode ser feita em paralelo

### Riscos Identificados
1. **APIs externas**: podem ter limitações de rate
2. **OpenAI**: custo pode crescer rápido
3. **Complexidade**: geração de conteúdo é a mais complexa
4. **Tempo**: estimativa otimista, pode levar 10-14 semanas

---

**Última atualização**: 2025-01-06
**Versão**: 1.0
**Status**: Pronto para execução
