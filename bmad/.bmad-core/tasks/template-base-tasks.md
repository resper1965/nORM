# Template Base Tasks

Tasks específicas para desenvolvimento com o template Gabi Clean.

## Setup Tasks

### `setup-supabase`
**Agente**: Developer
**Descrição**: Configura conexão inicial com Supabase
**Steps**:
1. Criar projeto no Supabase
2. Copiar credenciais para `.env.local`
3. Testar conexão com `createClient()`
4. Verificar middleware funcionando

### `setup-i18n`
**Agente**: Developer
**Descrição**: Adiciona novo idioma ao projeto
**Steps**:
1. Adicionar código em `i18n/config.ts`
2. Criar `i18n/messages/[locale].json`
3. Copiar estrutura de `pt.json` e traduzir
4. Testar rota `/[locale]`

### `customize-branding`
**Agente**: UX Expert
**Descrição**: Personaliza tema de branding
**Steps**:
1. Editar `lib/branding/theme.ts`
2. Definir cores personalizadas
3. Aplicar em `app/globals.css`
4. Testar modo claro/escuro

## Development Tasks

### `add-translations`
**Agente**: Developer
**Descrição**: Adiciona novas chaves de tradução
**Steps**:
1. Adicionar chave em `i18n/messages/pt.json`
2. Traduzir para `en.json` e `es.json`
3. Usar `useTranslations()` ou `getTranslations()` no componente
4. Testar em todos os idiomas

### `create-supabase-table`
**Agente**: Developer / Architect
**Descrição**: Cria nova tabela no Supabase
**Steps**:
1. Definir schema em arquitetura
2. Criar migration SQL
3. Configurar RLS (Row Level Security)
4. Criar tipos TypeScript
5. Testar queries

### `create-dashboard-page`
**Agente**: Developer
**Descrição**: Cria nova página no dashboard
**Steps**:
1. Criar `app/[locale]/[page]/page.tsx`
2. Adicionar rota no sidebar
3. Adicionar traduções necessárias
4. Usar `DashboardLayout`
5. Testar responsividade e temas

### `integrate-supabase-query`
**Agente**: Developer
**Descrição**: Integra query do Supabase em componente
**Steps**:
1. Identificar se é client ou server component
2. Usar `createClient()` apropriado
3. Fazer query/insert/update
4. Tratar erros
5. Testar em diferentes cenários

## Quality Tasks

### `validate-i18n`
**Agente**: QA
**Descrição**: Valida cobertura de traduções
**Steps**:
1. Verificar todas as chaves em todos os idiomas
2. Testar todas as rotas com cada idioma
3. Verificar textos hardcoded
4. Validar formatação e contextos

### `test-supabase-integration`
**Agente**: QA
**Descrição**: Testa integração completa com Supabase
**Steps**:
1. Testar autenticação (se aplicável)
2. Testar CRUD operations
3. Validar RLS policies
4. Testar erro handling
5. Validar performance

### `test-branding-themes`
**Agente**: QA / UX Expert
**Descrição**: Valida branding em todos os cenários
**Steps**:
1. Testar modo claro
2. Testar modo escuro
3. Validar contraste de cores
4. Testar todos os componentes
5. Validar acessibilidade

