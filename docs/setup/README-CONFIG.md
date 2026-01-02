# Configuração - Gabi Clean Dashboard

Este documento explica as configurações implementadas no projeto.

## 🌍 Multiidiomas (i18n)

O projeto usa **next-intl** para suporte nativo a múltiplos idiomas.

### Idiomas Suportados
- 🇧🇷 Português (pt) - Padrão
- 🇺🇸 Inglês (en)
- 🇪🇸 Espanhol (es)

### Como Usar

```tsx
import { useTranslations } from 'next-intl';

export function MyComponent() {
  const t = useTranslations('dashboard');
  
  return <h1>{t('title')}</h1>;
}
```

### Estrutura de Traduções
- `i18n/messages/pt.json` - Traduções em português
- `i18n/messages/en.json` - Traduções em inglês
- `i18n/messages/es.json` - Traduções em espanhol

### URLs com Locale
- `/` - Idioma padrão (português)
- `/en` - Inglês
- `/pt` - Português
- `/es` - Espanhol

### Adicionar Novo Idioma

1. Adicione o código do idioma em `i18n/config.ts`:
```typescript
export const locales = ['en', 'pt', 'es', 'fr'] as const;
```

2. Crie arquivo de tradução: `i18n/messages/fr.json`
3. Copie estrutura de `pt.json` e traduza

## 🗄️ Supabase

Supabase está configurado nativamente para todas as funcionalidades.

### Configuração Inicial

1. Crie um projeto no [Supabase](https://supabase.com)
2. Copie `.env.example` para `.env.local`
3. Preencha as variáveis:

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon
SUPABASE_SERVICE_ROLE_KEY=sua-chave-service-role
```

### Como Usar

**Cliente (Browser):**
```tsx
import { createClient } from '@/lib/supabase/client';

const supabase = createClient();
const { data } = await supabase.from('tabela').select('*');
```

**Servidor:**
```tsx
import { createClient } from '@/lib/supabase/server';

const supabase = await createClient();
const { data } = await supabase.from('tabela').select('*');
```

**Middleware (Autenticação):**
O middleware já está configurado em `lib/supabase/middleware.ts` para gerenciar autenticação automaticamente.

### Funcionalidades Pré-configuradas
- ✅ Cliente do Supabase (browser)
- ✅ Cliente do Supabase (server)
- ✅ Middleware de autenticação
- ✅ Gerenciamento de cookies/sessões
- ✅ Proteção de rotas

## 🎨 Branding "Ness"

Sistema de branding baseado em "ness" mantendo compatibilidade com tema claro/escuro.

### Tema Padrão "Ness"
- **Cor Primária**: Azul Ness (#217 91% 60%)
- **Cor Secundária**: Mantém padrão
- **Accent**: Azul Ness ajustado
- **Background/Foreground**: Mantém cores existentes

### Como Usar

```tsx
import { useBranding } from '@/lib/hooks/use-branding';

export function MyComponent() {
  const { theme, isDark, toggleDarkMode, changeTheme } = useBranding();
  
  return (
    <button onClick={toggleDarkMode}>
      {isDark ? 'Light' : 'Dark'}
    </button>
  );
}
```

### Personalizar Branding

Edite `lib/branding/theme.ts`:

```typescript
export const myCustomTheme: BrandTheme = {
  name: 'custom',
  colors: {
    primary: '220 70% 50%',      // Seu azul personalizado
    secondary: '210 40% 96.1%',
    accent: '220 60% 45%',
    background: '0 0% 100%',
    foreground: '222.2 84% 4.9%',
  },
};
```

### Cores Mantidas
O sistema mantém todas as cores existentes do tema claro/escuro:
- ✅ Variáveis CSS preservadas
- ✅ Compatibilidade com Tailwind
- ✅ Suporte a dark mode
- ✅ Cores de chart, border, input, etc.

## 📝 Próximos Passos

1. **Configurar Supabase:**
   - Criar projeto no Supabase
   - Preencher variáveis de ambiente
   - Testar conexão

2. **Personalizar Branding:**
   - Ajustar cores em `lib/branding/theme.ts`
   - Testar em modo claro/escuro

3. **Adicionar Traduções:**
   - Adicionar novos textos nas mensagens
   - Criar novos idiomas se necessário

4. **Mover Arquivos:**
   - Mover páginas de `app/` para `app/[locale]/`
   - Atualizar imports e rotas

## 🔧 Estrutura de Arquivos

```
├── i18n/
│   ├── config.ts              # Configuração de idiomas
│   ├── request.ts             # Configuração do next-intl
│   └── messages/
│       ├── pt.json            # Português
│       ├── en.json            # Inglês
│       └── es.json            # Espanhol
├── lib/
│   ├── supabase/
│   │   ├── client.ts          # Cliente browser
│   │   ├── server.ts          # Cliente server
│   │   └── middleware.ts     # Middleware auth
│   └── branding/
│       └── theme.ts           # Temas e branding
├── components/
│   └── locale-switcher.tsx    # Seletor de idioma
└── .env.example               # Exemplo de variáveis Supabase
```

