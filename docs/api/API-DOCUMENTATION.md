# 📚 Documentação da API - n.ORM

## Visão Geral

A API do n.ORM é uma API RESTful que fornece endpoints para gerenciamento de reputação online, monitoramento de SERP, redes sociais, geração de conteúdo com IA e alertas.

**Base URL:** `https://norm-*.vercel.app/api`

**Autenticação:** Bearer Token (JWT via Supabase Auth)

---

## 🔐 Autenticação

Todos os endpoints (exceto cron jobs) requerem autenticação via Supabase.

### Headers Obrigatórios

```http
Authorization: Bearer <supabase_jwt_token>
Content-Type: application/json
```

### Obter Token

O token JWT é obtido automaticamente após login via Supabase Auth. O cliente Supabase gerencia a autenticação.

---

## 📋 Endpoints

### Health Check

#### `GET /api/health`

Verifica o status da aplicação.

**Resposta:**
```json
{
  "status": "ok",
  "timestamp": "2025-01-02T21:00:00.000Z"
}
```

---

### Clientes

#### `GET /api/clients`

Lista todos os clientes do usuário autenticado.

**Resposta:**
```json
{
  "clients": [
    {
      "id": "uuid",
      "name": "Empresa ABC",
      "industry": "Tecnologia",
      "website": "https://empresa.com.br",
      "is_active": true,
      "created_at": "2025-01-01T00:00:00.000Z"
    }
  ]
}
```

#### `GET /api/clients/[id]`

Obtém detalhes de um cliente específico.

#### `PUT /api/clients/[id]`

Atualiza um cliente.

**Body:**
```json
{
  "name": "Novo Nome",
  "website": "https://novosite.com.br",
  "is_active": true
}
```

#### `GET /api/clients/[id]/reputation`

Obtém score de reputação e breakdown de um cliente.

**Resposta:**
```json
{
  "score": 85.5,
  "breakdown": {
    "serp": 8.5,
    "news": 7.2,
    "social": 8.0,
    "trend": 7.8,
    "volume": 9.0
  },
  "calculated_at": "2025-01-02T00:00:00.000Z"
}
```

#### `GET /api/clients/[id]/keywords`

Lista keywords de um cliente.

#### `POST /api/clients/[id]/keywords`

Adiciona uma nova keyword.

**Body:**
```json
{
  "keyword": "empresa abc",
  "is_active": true
}
```

#### `DELETE /api/clients/[id]/keywords/[keywordId]`

Remove uma keyword.

#### `GET /api/clients/[id]/serp`

Obtém resultados SERP de um cliente.

---

### Conteúdo

#### `POST /api/generate-content`

Gera conteúdo com IA.

**Body:**
```json
{
  "clientId": "uuid",
  "topic": "Título do artigo",
  "targetKeywords": ["keyword1", "keyword2"],
  "articleCount": 3,
  "triggerMentionId": "uuid (opcional)"
}
```

**Resposta:**
```json
{
  "articles": [
    {
      "id": "uuid",
      "title": "Título do Artigo",
      "content": "Conteúdo completo...",
      "metaDescription": "Meta description...",
      "seoScore": 85,
      "readabilityScore": 78,
      "wordCount": 1200
    }
  ]
}
```

---

### Alertas

#### `GET /api/alerts`

Lista alertas do usuário.

**Query Parameters:**
- `clientId` (opcional): Filtrar por cliente
- `severity` (opcional): `critical`, `high`, `medium`, `low`
- `status` (opcional): `active`, `resolved`, `dismissed`
- `limit` (opcional): Número de resultados (padrão: 50)
- `offset` (opcional): Paginação

**Resposta:**
```json
{
  "alerts": [
    {
      "id": "uuid",
      "client_id": "uuid",
      "alert_type": "score_drop",
      "severity": "high",
      "title": "Reputation Score Drop: -5.2 points",
      "message": "Your reputation score dropped...",
      "status": "active",
      "created_at": "2025-01-02T00:00:00.000Z"
    }
  ],
  "total": 10
}
```

---

### Redes Sociais

#### `GET /api/social/mentions`

Lista menções em redes sociais.

**Query Parameters:**
- `clientId` (obrigatório)
- `platform` (opcional): `instagram`, `linkedin`, `facebook`
- `sentiment` (opcional): `positive`, `neutral`, `negative`
- `limit` (opcional): Padrão 50
- `offset` (opcional): Paginação

**Resposta:**
```json
{
  "posts": [
    {
      "id": "uuid",
      "platform": "instagram",
      "content": "Texto do post...",
      "sentiment": "positive",
      "sentiment_score": 0.8,
      "published_at": "2025-01-02T00:00:00.000Z",
      "engagement": {
        "likes": 150,
        "comments": 25,
        "shares": 10
      }
    }
  ],
  "total": 50
}
```

---

### WordPress

#### `POST /api/wordpress/publish`

Publica conteúdo no WordPress.

**Body:**
```json
{
  "contentId": "uuid",
  "wordpressSiteId": "uuid",
  "status": "draft"
}
```

**Resposta:**
```json
{
  "success": true,
  "wordpressPostId": 123,
  "url": "https://site.com/wp-admin/post.php?post=123&action=edit"
}
```

---

### Cron Jobs (Protegidos)

Todos os cron jobs requerem autenticação via `CRON_SECRET`.

**Header:**
```http
Authorization: Bearer <CRON_SECRET>
```

#### `POST /api/cron/calculate-reputation`

Recalcula scores de reputação para todos os clientes ativos.

**Execução:** Diário à meia-noite (via Vercel Cron)

#### `POST /api/cron/check-serp`

Verifica posições SERP para todas as keywords ativas.

**Execução:** Diário às 18h

#### `POST /api/cron/scrape-news`

Faz scraping de notícias do Google News.

**Execução:** Diário às 6h

#### `POST /api/cron/sync-social`

Sincroniza menções de redes sociais.

**Execução:** Diário às 12h

#### `POST /api/cron/send-alerts`

Envia emails para alertas pendentes.

**Execução:** Diário às 8h

---

## 📊 Códigos de Status HTTP

- `200` - Sucesso
- `201` - Criado com sucesso
- `400` - Requisição inválida
- `401` - Não autenticado
- `403` - Sem permissão
- `404` - Não encontrado
- `500` - Erro interno do servidor

---

## 🔄 Paginação

Endpoints que retornam listas suportam paginação via query parameters:

- `limit`: Número de resultados (padrão: 50, máximo: 100)
- `offset`: Número de resultados para pular (padrão: 0)

**Exemplo:**
```
GET /api/alerts?limit=20&offset=40
```

---

## ⚠️ Rate Limiting

- **API Endpoints:** 100 requisições/minuto por usuário
- **Cron Jobs:** Protegidos por CRON_SECRET
- **OpenAI API:** Rate limits da OpenAI aplicam-se

---

## 📝 Exemplos de Uso

### cURL

```bash
# Obter clientes
curl -X GET https://norm-*.vercel.app/api/clients \
  -H "Authorization: Bearer <token>"

# Gerar conteúdo
curl -X POST https://norm-*.vercel.app/api/generate-content \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "clientId": "uuid",
    "topic": "Título",
    "targetKeywords": ["keyword1"],
    "articleCount": 3
  }'
```

### JavaScript/TypeScript

```typescript
import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

// Obter clientes
const { data: clients } = await supabase
  .from('clients')
  .select('*');

// Gerar conteúdo
const response = await fetch('/api/generate-content', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    clientId: 'uuid',
    topic: 'Título',
    targetKeywords: ['keyword1'],
    articleCount: 3,
  }),
});
```

---

## 🔗 Links Úteis

- [Documentação Supabase](https://supabase.com/docs)
- [Documentação Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [Vercel Cron Jobs](https://vercel.com/docs/cron-jobs)

---

**Última atualização:** 2025-01-02
