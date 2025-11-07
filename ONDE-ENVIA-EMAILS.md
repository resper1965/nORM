# 📧 Onde o nORM envia e-mails?

Documento detalhando todos os locais onde o sistema envia e-mails e como funciona.

## 📍 Localização do Código de E-mail

### Arquivo principal:
- **`lib/notifications/email.ts`** - Serviço de envio de e-mails usando Resend

## 🔧 Serviço de E-mail

### 1. Função `sendEmail()` - Função genérica
```typescript
sendEmail(options: EmailOptions): Promise<void>
```

**Parâmetros:**
- `to`: string | string[] - Destinatário(s)
- `subject`: string - Assunto do e-mail
- `html`: string - Conteúdo HTML do e-mail
- `from`: string (opcional) - Remetente (padrão: 'nORM <noreply@norm.app>')

### 2. Função `sendAlertEmail()` - E-mail de alerta
```typescript
sendAlertEmail(to: string, alert: AlertData): Promise<void>
```

**Parâmetros:**
- `to`: string - E-mail do destinatário
- `alert`: Objeto com:
  - `title`: string - Título do alerta
  - `message`: string - Mensagem do alerta
  - `severity`: 'critical' | 'high' | 'medium' | 'low'
  - `clientName`: string - Nome do cliente
  - `dashboardUrl`: string - URL do dashboard

## 📨 Onde os e-mails são enviados?

### ⚠️ Status Atual: **NÃO IMPLEMENTADO COMPLETAMENTE**

A função `sendAlertEmail()` está criada, mas **não está sendo chamada** em nenhum lugar do código ainda.

### Locais onde DEVERIA enviar e-mails:

#### 1. **Alertas de Reputação** (Planejado)
- **Quando**: Quando um alerta crítico ou de alta severidade é gerado
- **Destinatário**: Usuários com acesso ao cliente (tabela `client_users`)
- **E-mail do usuário**: Vem da tabela `users` (Supabase Auth)
- **Função**: `sendAlertEmail()`
- **Status**: ⚠️ Função existe, mas não é chamada automaticamente

#### 2. **Mudanças Críticas no Score** (Planejado)
- **Quando**: Quando o score de reputação cai mais de 5 pontos
- **Destinatário**: Administradores e editores do cliente
- **E-mail**: Obtido da tabela `users` via `client_users`
- **Status**: ⚠️ Não implementado

#### 3. **Mudanças de Posição SERP** (Planejado)
- **Quando**: Quando uma keyword cai mais de 3 posições
- **Destinatário**: Usuários com notificações habilitadas
- **E-mail**: Obtido das configurações do usuário
- **Status**: ⚠️ Não implementado

#### 4. **Menções Negativas** (Planejado)
- **Quando**: Quando uma menção negativa é detectada
- **Destinatário**: Administradores do cliente
- **E-mail**: Obtido da tabela `users`
- **Status**: ⚠️ Não implementado

## 🔍 Como obter o e-mail do destinatário?

### Fonte dos e-mails:
1. **Tabela `users` (Supabase Auth)**
   - Campo: `email`
   - Acesso via: `supabase.auth.getUser()` ou query direta

2. **Tabela `client_users`**
   - Relaciona usuários com clientes
   - Permite obter todos os usuários de um cliente
   - Query exemplo:
   ```typescript
   const { data } = await supabase
     .from('client_users')
     .select('user_id, users(email)')
     .eq('client_id', clientId)
     .eq('role', 'admin'); // ou 'editor'
   ```

3. **Configurações do usuário** (Futuro)
   - Preferências de notificação
   - Tipo de alertas a receber
   - Frequência de e-mails

## 📋 Template de E-mail

### E-mail de Alerta (implementado)
O template HTML está em `sendAlertEmail()` e inclui:
- Cabeçalho com emoji de severidade
- Nome do cliente
- Mensagem do alerta
- Botões para ver Dashboard e Alertas
- Footer com informações do nORM
- Estilo inline CSS

**Emojis por severidade:**
- 🚨 Critical
- ⚠️ High
- 📢 Medium
- ℹ️ Low

## 🚀 Como implementar o envio automático?

### 1. Criar função para obter destinatários
```typescript
async function getAlertRecipients(clientId: string): Promise<string[]> {
  const supabase = await createClient();
  
  const { data } = await supabase
    .from('client_users')
    .select('user_id, users(email, role)')
    .eq('client_id', clientId)
    .in('role', ['admin', 'editor']); // Apenas admins e editores
  
  return data
    ?.map(cu => cu.users?.email)
    .filter((email): email is string => !!email) || [];
}
```

### 2. Chamar ao criar alertas
No cron job `calculate-reputation` ou ao detectar eventos críticos:
```typescript
// Quando um alerta crítico é gerado
if (alert.severity === 'critical' || alert.severity === 'high') {
  const recipients = await getAlertRecipients(clientId);
  
  for (const email of recipients) {
    await sendAlertEmail(email, {
      title: alert.title,
      message: alert.message,
      severity: alert.severity,
      clientName: client.name,
      dashboardUrl: `${env.NEXT_PUBLIC_APP_URL}/clients/${clientId}`,
    });
  }
  
  // Marcar como enviado
  await supabase
    .from('alerts')
    .update({ email_sent: true, email_sent_at: new Date() })
    .eq('id', alert.id);
}
```

### 3. Adicionar ao cron job de alertas
Criar/atualizar `app/api/cron/send-alert-emails/route.ts`:
```typescript
// Enviar e-mails para alertas não enviados
const { data: alerts } = await supabase
  .from('alerts')
  .select('*, clients(name)')
  .eq('status', 'active')
  .eq('email_sent', false)
  .in('severity', ['critical', 'high']);

for (const alert of alerts) {
  // Enviar e-mails...
}
```

## 📊 Estrutura do Banco de Dados

### Tabela `alerts`:
- `id`: UUID
- `client_id`: UUID
- `alert_type`: string
- `severity`: 'critical' | 'high' | 'medium' | 'low'
- `title`: string
- `message`: string
- `status`: 'active' | 'resolved' | 'dismissed'
- `email_sent`: boolean (default: false)
- `email_sent_at`: timestamp (nullable)

### Tabela `client_users`:
- `client_id`: UUID
- `user_id`: UUID
- `role`: 'admin' | 'editor' | 'viewer'

### Tabela `users` (Supabase Auth):
- `id`: UUID
- `email`: string
- `email_confirmed_at`: timestamp

## ✅ Resumo

**Status atual:**
- ✅ Serviço de e-mail implementado (Resend)
- ✅ Função `sendAlertEmail()` criada
- ✅ Template HTML de alerta pronto
- ⚠️ **Envio automático NÃO implementado**
- ⚠️ **Função não é chamada em nenhum lugar**

**Próximos passos:**
1. Criar função para obter destinatários
2. Integrar envio de e-mail nos cron jobs
3. Adicionar preferências de notificação
4. Implementar envio ao criar alertas críticos

## 🔗 Referências

- **Código**: `lib/notifications/email.ts`
- **Resend API**: https://resend.com/docs
- **Template**: Função `sendAlertEmail()` linha 58-117

