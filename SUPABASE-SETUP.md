# Setup Supabase - Guia Rápido

## 1. Criar Projeto no Supabase

1. Acesse [https://supabase.com](https://supabase.com)
2. Faça login ou crie uma conta
3. Clique em "New Project"
4. Preencha:
   - **Nome do projeto**: Ex: `gabi-clean-dashboard`
   - **Database Password**: Escolha uma senha forte
   - **Region**: Escolha a região mais próxima
5. Clique em "Create new project"

## 2. Obter Credenciais

1. No dashboard do projeto, vá em **Settings** → **API**
2. Copie as seguintes informações:
   - **Project URL** (NEXT_PUBLIC_SUPABASE_URL)
   - **anon public** key (NEXT_PUBLIC_SUPABASE_ANON_KEY)
   - **service_role** key (SUPABASE_SERVICE_ROLE_KEY) - **NÃO EXPONHA NO CLIENTE**

## 3. Configurar Variáveis de Ambiente

1. Copie `.env.example` para `.env.local`:
```bash
cp .env.example .env.local
```

2. Preencha as variáveis:
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 4. Estrutura Pré-configurada

O projeto já está configurado com:

### Cliente Browser (`lib/supabase/client.ts`)
```tsx
import { createClient } from '@/lib/supabase/client';
const supabase = createClient();
```

### Cliente Server (`lib/supabase/server.ts`)
```tsx
import { createClient } from '@/lib/supabase/server';
const supabase = await createClient();
```

### Middleware de Autenticação (`lib/supabase/middleware.ts`)
- Gerenciamento automático de sessões
- Proteção de rotas
- Refresh de tokens

## 5. Testar Conexão

Crie um arquivo de teste em `app/[locale]/test-supabase/page.tsx`:

```tsx
import { createClient } from '@/lib/supabase/server';

export default async function TestSupabase() {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('tabela_teste')
    .select('*')
    .limit(1);
  
  if (error) {
    return <div>Erro: {error.message}</div>;
  }
  
  return <div>Conexão OK! {JSON.stringify(data)}</div>;
}
```

## 6. Próximos Passos

- ✅ Configurar autenticação
- ✅ Criar tabelas no Supabase
- ✅ Configurar RLS (Row Level Security)
- ✅ Criar funções e triggers
- ✅ Configurar storage para arquivos

## Recursos Úteis

- [Documentação Supabase](https://supabase.com/docs)
- [Guia de Autenticação](https://supabase.com/docs/guides/auth)
- [Guia de Banco de Dados](https://supabase.com/docs/guides/database)

