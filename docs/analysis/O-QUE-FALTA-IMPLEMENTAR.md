# 🚧 O Que Falta Implementar - n.ORM

Documento completo listando todas as funcionalidades que ainda precisam ser implementadas.

## ⚠️ Status Geral

**Infraestrutura**: ✅ 90% completa  
**Funcionalidades Core**: ⚠️ 40% completa  
**Integrações Externas**: ⚠️ 20% completa  
**UI/UX**: ✅ 70% completa

---

## 🔴 CRÍTICO - Funcionalidades Core Não Implementadas

### 1. Geração de Conteúdo com IA
**Arquivo**: `app/api/generate-content/route.ts`  
**Status**: ⚠️ Estrutura criada, lógica não implementada

**O que falta**:
- [ ] Implementar chamada real para OpenAI API
- [ ] Gerar 3-5 artigos únicos com diferentes ângulos
- [ ] Análise SEO dos artigos gerados
- [ ] Validação de qualidade do conteúdo
- [ ] Salvamento no banco de dados

**Código atual**: Linha 52 tem `// TODO: Implement actual content generation`

---

### 2. Cálculo de Score de Reputação
**Arquivo**: `lib/reputation/calculator.ts`  
**Status**: ⚠️ Estrutura criada, cálculo não implementado

**O que falta**:
- [ ] Implementar cálculo real usando queries do Supabase
- [ ] Calcular breakdown (SERP, news, social, trend, volume)
- [ ] Considerar posições SERP
- [ ] Considerar sentimento de menções
- [ ] Considerar volume de menções
- [ ] Calcular tendência (comparar com período anterior)

**Código atual**: Linha 40 tem `// TODO: Implement actual calculation using Supabase queries`

---

### 3. Geração de Alertas
**Arquivo**: `lib/reputation/alert-generator.ts`  
**Status**: ⚠️ Estrutura criada, lógica não implementada

**O que falta**:
- [ ] Implementar detecção de menções negativas
- [ ] Implementar detecção de quedas de score (>5 pontos)
- [ ] Implementar detecção de mudanças SERP (>3 posições)
- [ ] Implementar detecção de menções negativas em redes sociais
- [ ] Implementar detecção de eventos críticos (score drop >10, conteúdo negativo no top 3)
- [ ] Integrar com sistema de e-mail para envio automático

**Código atual**: Linha 24 tem `// TODO: Implement actual alert generation logic`

---

### 4. Envio Automático de E-mails
**Arquivo**: `lib/notifications/email.ts`  
**Status**: ✅ Função criada, ⚠️ Não é chamada automaticamente

**O que falta**:
- [ ] Criar função para obter destinatários (admins/editores do cliente)
- [ ] Integrar envio de e-mail ao criar alertas críticos/alta severidade
- [ ] Criar cron job para enviar e-mails pendentes
- [ ] Atualizar campo `email_sent` no banco após envio
- [ ] Adicionar preferências de notificação por usuário

**Documento**: Ver `ONDE-ENVIA-EMAILS.md`

---

## 🟡 IMPORTANTE - Integrações Externas

### 5. Scraping de Notícias do Google News
**Arquivo**: `app/api/cron/scrape-news/route.ts`  
**Status**: ⚠️ Endpoint criado, scraping não implementado

**O que falta**:
- [ ] Implementar scraping real do Google News RSS
- [ ] Processar e analisar sentimento das notícias
- [ ] Detectar menções aos clientes
- [ ] Salvar no banco (tabela `news_mentions`)
- [ ] Detectar URLs de clientes vs terceiros

**Código atual**: Linha 40 tem `// TODO: Implement actual news scraping`

---

### 6. Sincronização de Redes Sociais
**Arquivo**: `app/api/cron/sync-social/route.ts`  
**Status**: ⚠️ Endpoint criado, sincronização não implementada

**O que falta**:
- [ ] Implementar sincronização do Instagram
- [ ] Implementar sincronização do LinkedIn
- [ ] Implementar sincronização do Facebook
- [ ] Analisar sentimento dos posts
- [ ] Detectar menções aos clientes
- [ ] Salvar no banco (tabela `social_posts`)

**Código atual**: Linha 36 tem `// TODO: Implement actual social media sync`

---

### 7. Integração com Instagram Graph API
**Arquivo**: `lib/social/instagram.ts`  
**Status**: ⚠️ Estrutura criada, chamadas não implementadas

**O que falta**:
- [ ] Implementar chamadas reais à API do Instagram
- [ ] Obter posts, comentários e stories
- [ ] Detectar menções
- [ ] Obter métricas de engajamento
- [ ] Implementar captura de screenshots de stories

**Código atual**: 
- Linha 49: `// TODO: Implement actual Instagram API calls`
- Linha 82: `// TODO: Implement story screenshot`

---

### 8. Integração com LinkedIn API
**Arquivo**: `lib/social/linkedin.ts`  
**Status**: ⚠️ Estrutura criada, chamadas não implementadas

**O que falta**:
- [ ] Implementar chamadas reais à API do LinkedIn v2
- [ ] Obter posts e comentários
- [ ] Detectar menções em company pages
- [ ] Obter métricas de engajamento
- [ ] Processar dados de forma adequada

**Código atual**: Linha 51 tem `// TODO: Implement actual LinkedIn API calls`

---

### 9. Integração com Facebook Graph API
**Arquivo**: `lib/social/facebook.ts`  
**Status**: ⚠️ Estrutura criada, chamadas não implementadas

**O que falta**:
- [ ] Implementar chamadas reais à API do Facebook
- [ ] Obter posts, comentários e reviews
- [ ] Detectar menções em páginas
- [ ] Obter métricas de engajamento
- [ ] Processar dados de forma adequada

**Código atual**: Linha 49 tem `// TODO: Implement actual Facebook API calls`

---

### 10. Feed Unificado de Redes Sociais
**Arquivo**: `lib/social/unified-feed.ts`  
**Status**: ⚠️ Estrutura criada, sincronização não implementada

**O que falta**:
- [ ] Implementar sincronização real para cada plataforma
- [ ] Agregar posts de todas as plataformas
- [ ] Ordenar por data/timestamp
- [ ] Filtrar por sentimento, plataforma, cliente
- [ ] Otimizar queries do banco

**Código atual**: Linha 85 tem `// TODO: Implement actual sync for each platform`

---

## 🟢 MÉDIA PRIORIDADE - Segurança e Validação

### 11. Verificação de Segurança em Cron Jobs
**Arquivos**: 
- `app/api/cron/calculate-reputation/route.ts`
- `app/api/cron/check-serp/route.ts`
- `app/api/cron/sync-social/route.ts`
- `app/api/cron/scrape-news/route.ts`

**O que falta**:
- [ ] Implementar verificação de CRON_SECRET ou service role
- [ ] Validar origem das requisições (Vercel Cron)
- [ ] Prevenir acesso não autorizado
- [ ] Adicionar rate limiting

**Código atual**: Linha 14/15 tem `// TODO: Verify cron secret or service role`

---

### 12. Criptografia de Senhas WordPress
**Arquivo**: `lib/wordpress/publisher.ts`  
**Status**: ⚠️ Senhas armazenadas em texto plano

**O que falta**:
- [ ] Implementar criptografia de senhas WordPress
- [ ] Descriptografar ao usar
- [ ] Usar chave de criptografia segura
- [ ] Migrar senhas existentes

**Código atual**: Linha 28 tem `// TODO: Decrypt password`

---

### 13. Detecção de Conteúdo do Cliente
**Arquivo**: `lib/scraping/serp-tracker.ts`  
**Status**: ⚠️ Campo sempre false

**O que falta**:
- [ ] Implementar detecção se URL pertence ao cliente
- [ ] Comparar com domínios cadastrados
- [ ] Marcar resultados corretamente
- [ ] Usar em cálculos de score

**Código atual**: Linha 39 tem `is_client_content: false, // TODO: Detect if URL belongs to client`

---

## 🔵 BAIXA PRIORIDADE - Melhorias e Otimizações

### 14. Logging em Produção
**Arquivo**: `lib/utils/logger.ts`  
**Status**: ⚠️ Apenas console.log

**O que falta**:
- [x] Logging via Vercel Logs ✅ (nativo, sem configuração necessária)
- [ ] Configurar níveis de log por ambiente
- [ ] Adicionar contexto e metadata
- [ ] Implementar alertas de erro crítico

**Código atual**: Linha 48 tem `// TODO: In production, send to logging service`

---

### 15. Páginas e Componentes Faltantes

#### 15.1. Página de Alertas Detalhada
**O que falta**:
- [ ] Criar página `/reputation/alerts` (mencionada em tasks.md T023)
- [ ] Listar todos os alertas
- [ ] Filtros por severidade, tipo, status
- [ ] Ações (marcar como resolvido, dismiss)

#### 15.2. Página de Configurações de Notificações
**O que falta**:
- [ ] Criar página de preferências de notificação
- [ ] Permitir usuário escolher tipos de alertas
- [ ] Frequência de e-mails
- [ ] Configurar canais (email, push, SMS)

#### 15.3. Componentes de Análise SEO
**O que falta**:
- [ ] Componente de análise SEO (`components/content/seo-score-panel.tsx`)
- [ ] Mostrar breakdown de score SEO
- [ ] Sugestões de melhorias
- [ ] Preview de como aparece no Google

#### 15.4. Editor de Conteúdo
**O que falta**:
- [ ] Componente editor de conteúdo (`components/content/content-editor.tsx`)
- [ ] Edição de artigos gerados
- [ ] Preview em tempo real
- [ ] Salvar rascunhos

---

## 📋 Funcionalidades do Spec Não Implementadas

### User Story 1 - SERP Crisis Detection
**Status**: ⚠️ 60% completo

**Falta**:
- [ ] Detecção automática de conteúdo negativo na página 1-2
- [ ] Envio automático de alertas por e-mail
- [ ] Botão "Generate Response" em alertas
- [ ] Atualização automática de posições SERP

### User Story 2 - AI Content Generation
**Status**: ⚠️ 30% completo

**Falta**:
- [ ] Geração real de conteúdo (atualmente apenas estrutura)
- [ ] Geração de 3-5 artigos únicos
- [ ] Cálculo de score SEO
- [ ] Preview de resultados no Google
- [ ] Publicação automática como drafts no WordPress

### User Story 3 - Social Media Monitoring
**Status**: ⚠️ 20% completo

**Falta**:
- [ ] Integração real com APIs (Instagram, LinkedIn, Facebook)
- [ ] Detecção de menções em tempo real
- [ ] Análise de sentimento automática
- [ ] Alertas para menções negativas
- [ ] Dashboard de monitoramento em tempo real

### User Story 4 - Brazilian Market Focus
**Status**: ⚠️ 50% completo

**Falta**:
- [ ] Configuração hardcoded para google.com.br
- [ ] Validação de conteúdo em PT-BR
- [ ] Detecção de idioma em notícias
- [ ] Filtros de idioma na UI

### User Story 5 - Reputation Score
**Status**: ⚠️ 70% completo

**Falta**:
- [ ] Cálculo real do score (atualmente mock)
- [ ] Breakdown detalhado (SERP, news, social, trend, volume)
- [ ] Gráfico de tendência histórica
- [ ] Comparação com período anterior

### User Story 6 - WordPress Auto-Publishing
**Status**: ⚠️ 60% completo

**Falta**:
- [ ] Interface para configurar sites WordPress
- [ ] Teste de conexão
- [ ] Publicação automática como drafts
- [ ] Gerenciamento de sites WordPress

### User Story 7 - Dashboard Overview
**Status**: ✅ 80% completo

**Falta**:
- [ ] Melhorias de performance
- [ ] Atualização em tempo real
- [ ] Filtros avançados
- [ ] Exportação de dados

### User Story 8 - Multi-Client Management
**Status**: ✅ 70% completo

**Falta**:
- [ ] Seleção de cliente na UI
- [ ] Troca rápida entre clientes
- [ ] Comparação entre clientes
- [ ] Relatórios agregados

---

## 🔧 Tarefas Técnicas Pendentes

### Testes
- [ ] Testes unitários para cálculo de score
- [ ] Testes de integração para APIs externas
- [ ] Testes E2E para fluxo completo
- [ ] Testes de carga para cron jobs

### Performance
- [ ] Otimização de queries do banco
- [ ] Cache de resultados
- [ ] Lazy loading de componentes
- [ ] Otimização de imagens

### Documentação
- [ ] Documentação de API completa
- [ ] Guia de deployment
- [ ] Documentação de integrações
- [ ] Troubleshooting guide

---

## 📊 Resumo por Categoria

### 🔴 Crítico (Bloqueia MVP)
1. Geração de conteúdo com IA
2. Cálculo de score de reputação
3. Geração de alertas
4. Envio automático de e-mails

### 🟡 Importante (Funcionalidades Core)
5. Scraping de notícias
6. Sincronização de redes sociais
7. Integrações Instagram/LinkedIn/Facebook
8. Feed unificado

### 🟢 Melhorias (Não bloqueia MVP)
9. Verificação de segurança em cron jobs
10. Criptografia de senhas WordPress
11. Detecção de conteúdo do cliente
12. Logging em produção
13. Páginas e componentes faltantes

---

## 🎯 Priorização Recomendada

### Fase 1 - MVP Funcional (1-2 semanas)
1. ✅ Infraestrutura (já feito)
2. 🔴 Cálculo de score de reputação
3. 🔴 Geração de alertas
4. 🔴 Envio automático de e-mails
5. 🔴 Geração de conteúdo com IA (básico)

### Fase 2 - Integrações Core (1-2 semanas)
6. 🟡 Scraping de notícias
7. 🟡 Integração Instagram (prioridade)
8. 🟡 Integração LinkedIn
9. 🟡 Feed unificado

### Fase 3 - Refinamento (1 semana)
10. 🟢 Segurança de cron jobs
11. 🟢 Criptografia WordPress
12. 🟢 Páginas faltantes
13. 🟢 Testes

---

## 📝 Notas

- A maioria das estruturas estão criadas, falta implementar a lógica
- As integrações com APIs externas precisam de credenciais e testes
- O sistema de alertas precisa ser integrado com o cálculo de score
- O envio de e-mails precisa ser acionado automaticamente

---

**Última atualização**: 2025-01-06  
**Status geral do projeto**: ⚠️ 50% completo

