# 📚 Documentação da API n.ORM

## Visão Geral

Esta documentação descreve todos os endpoints da API do n.ORM.

## 📖 Documentos Disponíveis

1. **[API-DOCUMENTATION.md](./API-DOCUMENTATION.md)** - Documentação completa da API em formato Markdown
2. **[openapi.yaml](../../openapi.yaml)** - Especificação OpenAPI 3.0 (Swagger)

## 🚀 Como Usar

### Visualizar OpenAPI/Swagger

1. **Swagger UI Online:**
   - Acesse: https://editor.swagger.io/
   - Cole o conteúdo de `openapi.yaml`

2. **Swagger UI Local:**
   ```bash
   npx swagger-ui-serve openapi.yaml
   ```

3. **Redoc:**
   ```bash
   npx @redocly/cli preview-docs openapi.yaml
   ```

### Testar Endpoints

Use a documentação em `API-DOCUMENTATION.md` para exemplos de uso com cURL e JavaScript.

## 🔐 Autenticação

Todos os endpoints (exceto `/api/health` e cron jobs) requerem autenticação via Supabase JWT.

## 📋 Endpoints Principais

- **Clientes:** `/api/clients`
- **Reputação:** `/api/clients/[id]/reputation`
- **Conteúdo:** `/api/generate-content`
- **Alertas:** `/api/alerts`
- **Redes Sociais:** `/api/social/mentions`
- **WordPress:** `/api/wordpress/publish`

## 🔄 Cron Jobs

- `/api/cron/calculate-reputation` - Recalcula scores
- `/api/cron/check-serp` - Verifica posições SERP
- `/api/cron/scrape-news` - Scraping de notícias
- `/api/cron/sync-social` - Sincroniza redes sociais
- `/api/cron/send-alerts` - Envia emails de alertas

---

**Última atualização:** 2025-01-02
