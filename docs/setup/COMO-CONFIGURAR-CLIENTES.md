# 📋 Como Configurar Clientes e Dados

## 🎯 Visão Geral

Existem **3 formas** de configurar clientes e dados no n.ORM:

1. **Interface Web (UI)** - Recomendado para uso normal
2. **Seed Data (SQL)** - Para dados iniciais/testes
3. **API REST** - Para integrações/automação

---

## 1️⃣ Via Interface Web (UI)

### 1.1 Criar Novo Cliente

**URL:** `/clients/new` ou clique em "Add Client" na lista

**Passos:**
1. Acesse: `http://localhost:3000/clients/new` (ou sua URL de produção)
2. Preencha:
   - **Nome do Cliente** (obrigatório)
   - **Website** (opcional)
   - **Indústria** (opcional)
   - **Keywords** (uma por linha)
3. Clique em "Create Client"

**Nota:** O usuário logado será automaticamente vinculado como **admin** do cliente.

### 1.2 Configurar Cliente Existente

**URL:** `/clients/[id]/settings`

**Passos:**
1. Acesse a lista de clientes: `/clients`
2. Clique no cliente desejado
3. Vá em **Settings** (ou `/clients/[id]/settings`)
4. Configure:
   - **Informações básicas** (nome, website, indústria)
   - **Keywords** (adicionar/remover)
   - **Contas sociais** (Instagram, LinkedIn, Facebook)

### 1.3 Adicionar Keywords

**Na página de Settings do cliente:**

1. No campo "Enter keyword", digite a palavra-chave
2. Clique em "Add" ou pressione Enter
3. A keyword será salva automaticamente

**Exemplo de keywords:**
```
gestão de reputação online
monitoramento de marca
análise de sentimento
SEO Brasil
reputação digital
```

### 1.4 Adicionar Contas Sociais

**Na página de Settings do cliente:**

1. Seção "Social Media Accounts"
2. Clique em "Add Account"
3. Preencha:
   - **Platform** (Instagram, LinkedIn, Facebook)
   - **Account ID/Username**
   - **Access Token** (criptografado automaticamente)
4. Salve

**Nota:** Os tokens são criptografados com AES-256-GCM antes de salvar.

---

## 2️⃣ Via Seed Data (SQL)

### 2.1 Executar Seed Data

O arquivo `supabase/seed.sql` já foi aplicado via MCP, mas você pode executar manualmente:

**Via Supabase Dashboard:**
1. Acesse: Supabase Dashboard > SQL Editor
2. Cole o conteúdo de `supabase/seed.sql`
3. Execute

**Via CLI:**
```bash
psql $DATABASE_URL -f supabase/seed.sql
```

### 2.2 Seed Data Atual

O seed atual cria:
- ✅ 1 cliente: "Cliente Exemplo"
- ✅ 5 keywords de exemplo
- ✅ Vincula o primeiro usuário como admin

**Conteúdo do seed:**
```sql
-- Cliente
INSERT INTO clients (name, industry, website, created_by, is_active)
VALUES ('Cliente Exemplo', 'Tecnologia', 'https://exemplo.com.br', user_id, true);

-- Keywords
INSERT INTO keywords (client_id, keyword, priority, is_active)
VALUES 
  (client_id, 'gestão de reputação online', 'high', true),
  (client_id, 'monitoramento de marca', 'high', true),
  (client_id, 'análise de sentimento', 'normal', true),
  (client_id, 'SEO Brasil', 'normal', true),
  (client_id, 'reputação digital', 'normal', true);
```

### 2.3 Personalizar Seed Data

Edite `supabase/seed.sql` e adicione seus próprios dados:

```sql
-- Exemplo: Criar múltiplos clientes
INSERT INTO clients (name, industry, website, created_by, is_active)
VALUES 
  ('Empresa A', 'Tecnologia', 'https://empresa-a.com.br', user_id, true),
  ('Empresa B', 'E-commerce', 'https://empresa-b.com.br', user_id, true);

-- Exemplo: Adicionar keywords específicas
INSERT INTO keywords (client_id, keyword, priority, is_active)
SELECT 
  c.id,
  unnest(ARRAY['palavra-chave 1', 'palavra-chave 2', 'palavra-chave 3']),
  'high',
  true
FROM clients c
WHERE c.name = 'Empresa A';
```

---

## 3️⃣ Via API REST

### 3.1 Criar Cliente

```bash
POST /api/clients
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Novo Cliente",
  "website": "https://exemplo.com.br",
  "industry": "Tecnologia"
}
```

**Resposta:**
```json
{
  "client": {
    "id": "uuid",
    "name": "Novo Cliente",
    "website": "https://exemplo.com.br",
    "industry": "Tecnologia",
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

### 3.2 Adicionar Keyword

```bash
POST /api/clients/{client_id}/keywords
Authorization: Bearer <token>
Content-Type: application/json

{
  "keyword": "palavra-chave",
  "alert_threshold": 5
}
```

**Resposta:**
```json
{
  "keyword": {
    "id": "uuid",
    "client_id": "uuid",
    "keyword": "palavra-chave",
    "priority": "normal",
    "is_active": true,
    "alert_threshold": 5
  }
}
```

### 3.3 Listar Clientes

```bash
GET /api/clients
Authorization: Bearer <token>
```

**Resposta:**
```json
{
  "clients": [
    {
      "id": "uuid",
      "name": "Cliente Exemplo",
      "website": "https://exemplo.com.br",
      "industry": "Tecnologia",
      "is_active": true
    }
  ]
}
```

---

## 4️⃣ Via SQL Direto (Supabase Dashboard)

### 4.1 Criar Cliente Manualmente

```sql
-- 1. Obter seu user_id
SELECT id FROM auth.users WHERE email = 'seu-email@exemplo.com';

-- 2. Criar cliente
INSERT INTO clients (name, industry, website, created_by, is_active)
VALUES (
  'Meu Cliente',
  'Tecnologia',
  'https://meucliente.com.br',
  'seu-user-id-aqui',
  true
)
RETURNING id;

-- 3. Vincular-se como admin
INSERT INTO client_users (client_id, user_id, role)
VALUES (
  'client-id-retornado',
  'seu-user-id',
  'admin'
);
```

### 4.2 Adicionar Keywords

```sql
-- Adicionar keyword
INSERT INTO keywords (client_id, keyword, priority, is_active, alert_threshold)
VALUES (
  'client-id',
  'palavra-chave',
  'high',
  true,
  5
);

-- Adicionar múltiplas keywords
INSERT INTO keywords (client_id, keyword, priority, is_active)
VALUES 
  ('client-id', 'keyword 1', 'high', true),
  ('client-id', 'keyword 2', 'normal', true),
  ('client-id', 'keyword 3', 'low', true);
```

### 4.3 Adicionar Conta Social

```sql
-- Nota: O access_token precisa ser criptografado
-- Use a função encrypt() ou faça via API/UI

INSERT INTO social_accounts (
  client_id,
  platform,
  account_id,
  account_username,
  access_token_encrypted,
  is_active
)
VALUES (
  'client-id',
  'instagram',
  'account-id',
  'username',
  'token-criptografado', -- Use encrypt() ou API
  true
);
```

---

## 🔐 Permissões e Acesso

### Roles Disponíveis

- **admin**: Acesso total (criar, editar, deletar)
- **editor**: Pode editar (keywords, conteúdo)
- **viewer**: Apenas visualização

### Como Vincular Usuário a Cliente

**Via SQL:**
```sql
INSERT INTO client_users (client_id, user_id, role)
VALUES ('client-id', 'user-id', 'admin');
```

**Via UI:**
- Acesse Settings do cliente
- Seção "Team Members"
- Adicione usuário por email

---

## 📊 Estrutura de Dados

### Cliente (clients)
- `id` (UUID)
- `name` (string)
- `website` (string, opcional)
- `industry` (string, opcional)
- `created_by` (UUID, user_id)
- `is_active` (boolean)

### Keyword (keywords)
- `id` (UUID)
- `client_id` (UUID)
- `keyword` (string)
- `priority` ('high', 'normal', 'low')
- `is_active` (boolean)
- `alert_threshold` (number, default: 5)

### Conta Social (social_accounts)
- `id` (UUID)
- `client_id` (UUID)
- `platform` ('instagram', 'linkedin', 'facebook')
- `account_id` (string)
- `account_username` (string)
- `access_token_encrypted` (string, criptografado)
- `is_active` (boolean)

---

## ✅ Checklist de Configuração

Para um cliente funcionar completamente:

- [ ] Cliente criado
- [ ] Usuário vinculado como admin/editor
- [ ] Pelo menos 1 keyword adicionada
- [ ] Website configurado (para scraping de notícias)
- [ ] (Opcional) Contas sociais configuradas
- [ ] (Opcional) Sites WordPress configurados

---

## 🚀 Próximos Passos

Após configurar o cliente:

1. **Aguardar cron jobs** executarem:
   - `/api/cron/check-serp` - Verifica posições SERP
   - `/api/cron/scrape-news` - Coleta notícias
   - `/api/cron/sync-social` - Sincroniza redes sociais
   - `/api/cron/calculate-reputation` - Calcula score

2. **Verificar dados** no dashboard:
   - `/clients/[id]` - Visão geral do cliente
   - `/dashboard` - Métricas globais

3. **Configurar alertas** (se necessário):
   - Thresholds de keywords
   - Notificações por email

---

## 📝 Exemplos Práticos

### Exemplo 1: Cliente Completo via UI

1. Criar cliente: `/clients/new`
   - Nome: "Minha Empresa"
   - Website: "https://minhaempresa.com.br"
   - Keywords: "minha empresa", "produto x", "serviço y"

2. Configurar: `/clients/[id]/settings`
   - Adicionar mais keywords
   - Adicionar contas sociais

### Exemplo 2: Múltiplos Clientes via SQL

```sql
-- Criar 3 clientes de uma vez
WITH new_clients AS (
  INSERT INTO clients (name, industry, website, created_by, is_active)
  VALUES 
    ('Cliente 1', 'Tech', 'https://cliente1.com', user_id, true),
    ('Cliente 2', 'E-commerce', 'https://cliente2.com', user_id, true),
    ('Cliente 3', 'Saúde', 'https://cliente3.com', user_id, true)
  RETURNING id, name
)
SELECT * FROM new_clients;
```

---

## ❓ Dúvidas Frequentes

**Q: Preciso criar usuário primeiro?**  
R: Sim, crie via Supabase Auth UI ou `/register` antes de criar clientes.

**Q: Posso ter múltiplos clientes?**  
R: Sim, um usuário pode ser admin/editor de múltiplos clientes.

**Q: Como deletar um cliente?**  
R: Via UI em Settings, ou via SQL: `DELETE FROM clients WHERE id = '...'`

**Q: Keywords são case-sensitive?**  
R: Não, o sistema normaliza para busca (mas armazena como digitado).

**Q: Posso importar keywords em massa?**  
R: Sim, via SQL ou API. Veja exemplo em "Personalizar Seed Data".
