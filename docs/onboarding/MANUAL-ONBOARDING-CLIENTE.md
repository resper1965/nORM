# 🚀 Manual de Onboarding - n.ORM

## Bem-vindo ao n.ORM! 👋

Este guia vai te ajudar a configurar e começar a usar o **n.ORM (Online Reputation Manager)** em poucos minutos.

---

## 📋 Índice

1. [Primeiro Acesso](#1-primeiro-acesso)
2. [Criar sua Conta](#2-criar-sua-conta)
3. [Fazer Login](#3-fazer-login)
4. [Conhecer o Dashboard](#4-conhecer-o-dashboard)
5. [Criar seu Primeiro Cliente](#5-criar-seu-primeiro-cliente)
6. [Configurar Keywords](#6-configurar-keywords)
7. [Configurar Contas Sociais (Opcional)](#7-configurar-contas-sociais-opcional)
8. [Entender os Dados](#8-entender-os-dados)
9. [Próximos Passos](#9-próximos-passos)
10. [Dúvidas Frequentes](#10-dúvidas-frequentes)

---

## 1️⃣ Primeiro Acesso

### 1.1 Acesse a Plataforma

**URL:** `https://seu-dominio.com` (ou URL fornecida pela sua equipe)

Você verá a página inicial com:
- Logo n.ORM
- Botões "Log In" e "Get Started"
- Informações sobre a plataforma

### 1.2 Escolha sua Ação

- **Já tem conta?** → Clique em "Log In"
- **É novo aqui?** → Clique em "Get Started" ou "Create an account"

---

## 2️⃣ Criar sua Conta

### 2.1 Preencher Formulário

1. Acesse: `/register` ou clique em "Create an account"
2. Preencha os campos:
   - **Email:** Seu email profissional
   - **Password:** Mínimo 8 caracteres
   - **Confirm Password:** Digite novamente

### 2.2 Criar Conta

1. Clique em **"Create account"**
2. Aguarde confirmação
3. Você será redirecionado para a página de login

### 2.3 Verificar Email (se necessário)

Se solicitado, verifique seu email e clique no link de confirmação.

---

## 3️⃣ Fazer Login

### 3.1 Acessar Login

1. Acesse: `/login`
2. Digite:
   - **Email:** Seu email cadastrado
   - **Password:** Sua senha

### 3.2 Entrar

1. Clique em **"Sign in"**
2. Você será redirecionado para o **Dashboard**

---

## 4️⃣ Conhecer o Dashboard

Após fazer login, você verá o **Dashboard Principal** com:

### 4.1 KPIs Principais (Cards no Topo)

#### 📊 Global Reputation Score
- **O que é:** Score geral de reputação (0-100)
- **Como é calculado:**
  - 35% - Posição no Google (SERP)
  - 25% - Sentimento de Notícias
  - 20% - Sentimento de Redes Sociais
  - 15% - Tendência
  - 5% - Volume de Menções
- **Interpretação:**
  - **70-100:** Boa reputação ✅
  - **40-69:** Reputação média ⚠️
  - **0-39:** Reputação baixa ❌

#### 🚨 Critical Alerts
- **O que é:** Número de alertas críticos ativos
- **Quando aparece:** Conteúdo negativo detectado
- **Ação:** Clique para ver detalhes

#### 📢 Mentions Volume
- **O que é:** Total de menções (notícias + redes sociais)
- **Tendência:** Comparação com período anterior

#### ✨ AI Articles Generated
- **O que é:** Artigos gerados pela IA
- **Meta:** 200 artigos/mês

### 4.2 Gráficos e Feed

#### 📈 Sentiment Trend Chart
- **O que mostra:** Tendência de sentimento nos últimos 30 dias
- **Como ler:** Linha azul = sentimento positivo

#### 🔔 Live Intelligence Feed
- **O que mostra:** Alertas e menções recentes em tempo real
- **Ações:** Clique em qualquer item para ver detalhes

### 4.3 Menu Lateral

- **Dashboard** - Visão geral
- **Clients** - Gerenciar clientes
- **Content** - Conteúdo gerado
- **Social** - Redes sociais
- **Settings** - Configurações

---

## 5️⃣ Criar seu Primeiro Cliente

### 5.1 Acessar Página de Clientes

1. No menu lateral, clique em **"Clients"**
2. Ou acesse: `/clients`

### 5.2 Adicionar Novo Cliente

1. Clique no botão **"Add Client"** (canto superior direito)
2. Um modal/diálogo abrirá

### 5.3 Preencher Informações

#### Informações Básicas

- **Nome do Cliente** (obrigatório)
  - Exemplo: "Minha Empresa", "Cliente XYZ"
  
- **Website** (opcional)
  - Exemplo: `https://minhaempresa.com.br`
  - **Importante:** Usado para scraping de notícias
  
- **Indústria** (opcional)
  - Exemplo: "Tecnologia", "E-commerce", "Saúde"

#### Keywords (Palavras-chave)

No campo **"Monitoring Keywords"**, adicione uma palavra-chave por linha:

```
minha empresa
produto x
serviço y
CEO nome
marca abc
```

**Dicas:**
- Use o nome da empresa/marca
- Inclua produtos/serviços principais
- Adicione nomes de executivos (se relevante)
- Use variações e sinônimos

**Exemplo Real:**
```
nORM
Online Reputation Manager
gestão de reputação online
monitoramento de marca
análise de sentimento
```

### 5.4 Salvar Cliente

1. Revise as informações
2. Clique em **"Create Client"**
3. O cliente será criado e você será vinculado como **admin**

### 5.5 Confirmação

Você verá:
- ✅ Mensagem de sucesso
- Cliente aparecendo na lista
- Redirecionamento para a lista de clientes

---

## 6️⃣ Configurar Keywords

### 6.1 Acessar Settings do Cliente

1. Na lista de clientes (`/clients`)
2. Clique no cliente desejado
3. Vá em **"Settings"** (ou `/clients/[id]/settings`)

### 6.2 Adicionar Keywords

1. Na seção **"Keywords to Monitor"**
2. Digite a keyword no campo
3. Clique em **"Add"** ou pressione Enter
4. A keyword será salva automaticamente

### 6.3 Gerenciar Keywords

- **Ver todas:** Lista abaixo do campo de input
- **Remover:** Clique no ícone de lixeira ao lado da keyword
- **Prioridade:** Configure se necessário (high, normal, low)

### 6.4 Boas Práticas

✅ **Faça:**
- Adicione 5-10 keywords principais
- Use termos que as pessoas realmente pesquisam
- Inclua variações e sinônimos
- Atualize conforme necessário

❌ **Evite:**
- Keywords muito genéricas ("empresa", "negócio")
- Muitas keywords irrelevantes
- Keywords com erros de ortografia

---

## 7️⃣ Configurar Contas Sociais (Opcional)

### 7.1 Por Que Configurar?

- Monitora menções em redes sociais
- Analisa sentimento de posts/comentários
- Detecta crises em tempo real
- Integra dados no score de reputação

### 7.2 Acessar Configuração

1. Vá em **Settings** do cliente
2. Seção **"Social Media Accounts"**

### 7.3 Adicionar Conta

1. Clique em **"Add Account"**
2. Preencha:
   - **Platform:** Instagram, LinkedIn ou Facebook
   - **Account ID/Username:** ID da conta
   - **Access Token:** Token de acesso da API
3. Clique em **"Save"**

### 7.4 Obter Tokens de Acesso

#### Instagram
- Acesse: [Facebook Developers](https://developers.facebook.com/)
- Crie um App
- Configure Instagram Basic Display API
- Gere Access Token

#### LinkedIn
- Acesse: [LinkedIn Developers](https://www.linkedin.com/developers/)
- Crie uma App
- Configure permissões
- Gere Access Token

#### Facebook
- Acesse: [Facebook Developers](https://developers.facebook.com/)
- Crie um App
- Configure Facebook Graph API
- Gere Access Token

**Nota:** Os tokens são criptografados automaticamente antes de salvar.

### 7.5 Segurança

- ✅ Tokens são criptografados (AES-256-GCM)
- ✅ Apenas admins podem gerenciar contas
- ✅ Tokens não são exibidos após salvar

---

## 8️⃣ Entender os Dados

### 8.1 Quando os Dados Aparecem?

Os dados são coletados automaticamente por **cron jobs** que rodam periodicamente:

- **SERP (Google):** A cada 6 horas
- **Notícias:** A cada 4 horas
- **Redes Sociais:** A cada 2 horas
- **Score de Reputação:** Diariamente

**Primeira coleta:** Pode levar até 6 horas após criar o cliente.

### 8.2 O Que Cada Métrica Significa?

#### Score de Reputação (0-100)

**Como é calculado:**

```
Score = (SERP × 0.35) + (News × 0.25) + (Social × 0.20) + (Trend × 0.15) + (Volume × 0.05)
```

**Breakdown:**
- **SERP (35%):** Posição média no Google
  - Posição 1-3 = 10 pontos
  - Posição 4-10 = 7.5 pontos
  - Posição 11-20 = 5 pontos
  - Acima de 20 = 0 pontos

- **News (25%):** Sentimento médio de notícias
  - Sentimento positivo = 10 pontos
  - Sentimento neutro = 5 pontos
  - Sentimento negativo = 0 pontos

- **Social (20%):** Sentimento médio de redes sociais
  - Mesma lógica das notícias

- **Trend (15%):** Tendência (melhora/piora)
  - Compara com período anterior

- **Volume (5%):** Quantidade de menções
  - Mais menções = mais relevância

#### Alertas

**Tipos de Alertas:**

1. **Score Drop** 🚨
   - Score caiu significativamente
   - Severidade: Critical/High

2. **Negative News** 📰
   - Notícia negativa detectada
   - Severidade: High/Medium

3. **Negative Social** 📱
   - Post/comentário negativo
   - Severidade: High/Medium

4. **SERP Drop** 📉
   - Posição no Google caiu
   - Severidade: Medium

5. **Critical SERP Content** ⚠️
   - Conteúdo negativo na página 1-2 do Google
   - Severidade: Critical

**Ações:**
- **Ver detalhes:** Clique no alerta
- **Marcar como resolvido:** Botão "Resolve"
- **Gerar resposta:** Botão "Generate Response" (gera artigo com IA)

### 8.3 Visualizar Dados do Cliente

1. Acesse: `/clients/[id]`
2. Você verá:
   - Score de reputação atual
   - Gráfico de tendência
   - Posições SERP
   - Últimas menções
   - Alertas ativos

---

## 9️⃣ Próximos Passos

### 9.1 Checklist Inicial

Após criar o cliente, verifique:

- [ ] Cliente criado com sucesso
- [ ] Keywords adicionadas (mínimo 3-5)
- [ ] Website configurado (se aplicável)
- [ ] (Opcional) Contas sociais configuradas

### 9.2 Aguardar Primeira Coleta

- ⏱️ **Tempo:** 2-6 horas
- 📊 **O que acontece:**
  - Sistema verifica posições no Google
  - Coleta notícias recentes
  - Sincroniza redes sociais (se configuradas)
  - Calcula score inicial

### 9.3 Monitorar Dashboard

1. Acesse `/dashboard` regularmente
2. Verifique:
   - Score de reputação
   - Novos alertas
   - Tendências
   - Menções recentes

### 9.4 Responder a Alertas

Quando receber alertas:

1. **Analise o problema:**
   - Leia a notícia/post negativo
   - Verifique posição no Google
   - Avalie impacto

2. **Ações possíveis:**
   - **Gerar resposta com IA:** Clique em "Generate Response"
   - **Publicar conteúdo positivo:** Use o conteúdo gerado
   - **Marcar como resolvido:** Se já foi tratado

### 9.5 Gerar Conteúdo com IA

1. Acesse: `/content/generate`
2. Ou clique em "Generate Response" em um alerta
3. Preencha:
   - **Tema/Tópico**
   - **Contexto** (opcional)
   - **Trigger Mention** (se gerando resposta)
4. Clique em **"Generate Content"**
5. Aguarde (pode levar 1-2 minutos)
6. Revise o conteúdo gerado
7. Publique no WordPress (se configurado) ou copie manualmente

### 9.6 Configurar WordPress (Opcional)

Para publicação automática:

1. Vá em **Settings** do cliente
2. Seção **"WordPress Sites"**
3. Adicione:
   - **URL do site WordPress**
   - **Username**
   - **Password** (criptografado)
4. Teste conexão
5. Salve

**Nota:** Conteúdo será publicado como **draft** para revisão.

---

## 🔟 Dúvidas Frequentes

### Q: Quanto tempo leva para ver dados?

**R:** Primeira coleta: 2-6 horas. Coletas subsequentes:
- SERP: A cada 6 horas
- Notícias: A cada 4 horas
- Redes Sociais: A cada 2 horas

### Q: Preciso configurar contas sociais?

**R:** Não é obrigatório, mas recomendado. Sem contas sociais, o sistema usa apenas:
- Posições SERP (35%)
- Notícias (25%)
- Tendência e volume (20%)

### Q: Como adicionar mais keywords depois?

**R:** Vá em **Settings** do cliente → Seção **Keywords** → Adicione novas keywords.

### Q: Posso ter múltiplos clientes?

**R:** Sim! Você pode gerenciar quantos clientes quiser. Cada cliente tem seus próprios dados e configurações.

### Q: Como funciona o score de reputação?

**R:** É uma média ponderada de 5 fatores:
- 35% - Posição no Google
- 25% - Sentimento de notícias
- 20% - Sentimento de redes sociais
- 15% - Tendência
- 5% - Volume de menções

### Q: O que fazer quando recebo um alerta crítico?

**R:**
1. Analise o problema (leia notícia/post)
2. Clique em "Generate Response" para criar artigo com IA
3. Publique o conteúdo positivo
4. Monitore se o problema foi resolvido
5. Marque como resolvido quando apropriado

### Q: Posso exportar os dados?

**R:** Sim, há botão "Export" na lista de clientes. Exporta dados em CSV.

### Q: Como adicionar outros usuários ao cliente?

**R:** Vá em **Settings** do cliente → Seção **Team Members** → Adicione por email.

**Roles disponíveis:**
- **Admin:** Acesso total
- **Editor:** Pode editar (keywords, conteúdo)
- **Viewer:** Apenas visualização

### Q: O sistema funciona apenas no Brasil?

**R:** O sistema está otimizado para o mercado brasileiro:
- Busca no Google Brasil (google.com.br)
- Análise de conteúdo em PT-BR
- Foco em notícias brasileiras

### Q: Como desativar um cliente?

**R:** Vá em **Settings** → Desmarque **"Active"** → Salve.

### Q: Preciso de ajuda técnica. Onde encontro?

**R:**
- **Documentação:** `/docs`
- **Suporte:** Entre em contato com sua equipe
- **Email:** [seu-email-de-suporte]

---

## 📞 Suporte

### Precisa de Ajuda?

- 📧 **Email:** [seu-email]
- 💬 **Chat:** [seu-chat]
- 📚 **Documentação:** `/docs`
- 🐛 **Reportar Bug:** [link-do-github-issues]

### Recursos Adicionais

- 📖 **Guia Completo:** `docs/setup/COMO-CONFIGURAR-CLIENTES.md`
- 🔧 **API Docs:** `/api/docs`
- 🎥 **Vídeos Tutoriais:** [link-dos-videos]

---

## ✅ Checklist Final

Antes de considerar o onboarding completo:

- [ ] Conta criada e verificada
- [ ] Login funcionando
- [ ] Dashboard acessível
- [ ] Primeiro cliente criado
- [ ] Pelo menos 3 keywords adicionadas
- [ ] Website configurado (se aplicável)
- [ ] (Opcional) Contas sociais configuradas
- [ ] Entendeu como funciona o score
- [ ] Sabe como responder a alertas
- [ ] Configurou notificações (se necessário)

---

## 🎉 Parabéns!

Você está pronto para começar a gerenciar sua reputação online com o n.ORM!

**Próximos passos:**
1. Aguarde a primeira coleta de dados (2-6 horas)
2. Monitore o dashboard regularmente
3. Responda a alertas rapidamente
4. Use a IA para gerar conteúdo positivo
5. Acompanhe a evolução do score

**Boa sorte! 🚀**

---

*Última atualização: Janeiro 2024*
*Versão: 1.0*
