# Guia de Uso como Template

Este projeto foi configurado para ser usado como base (template) para todos os projetos futuros.

## Como Usar este Template

### 1. Clonar o Projeto

```bash
git clone [URL_DESTE_REPOSITORIO] nome-do-novo-projeto
cd nome-do-novo-projeto
```

### 2. Atualizar Configurações

Edite os seguintes arquivos com o nome do novo projeto:

- `package.json` - Atualize o campo `name`
- `app/layout.tsx` - Atualize `metadata.title` e `metadata.description`
- `README.md` - Atualize o conteúdo com informações do novo projeto

### 3. Instalar Dependências

```bash
npm install
```

### 4. Adicionar Componentes shadcn/ui

Este template já está configurado para usar shadcn/ui. Adicione componentes conforme necessário:

```bash
# Adicionar um componente específico
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add dialog
# etc...

# Ver todos os componentes disponíveis
npx shadcn@latest add
```

### 5. Personalizar o Tema

O tema pode ser personalizado em:

- `app/globals.css` - Variáveis CSS para cores e estilos
- `tailwind.config.ts` - Configurações do Tailwind CSS

Você também pode usar o [tweakcn.com](https://tweakcn.com) para criar temas visuais e exportar as variáveis CSS.

### 6. Começar a Desenvolver

```bash
npm run dev
```

## Estrutura do Template

```
.
├── app/                 # App Router do Next.js
│   ├── globals.css      # Estilos globais e variáveis CSS
│   ├── layout.tsx       # Layout raiz
│   └── page.tsx         # Página inicial
├── components/          # Componentes React
│   ├── ui/              # Componentes shadcn/ui (adicionados via CLI)
│   └── lib/             # Componentes customizados
├── lib/                 # Utilitários
│   └── utils.ts         # Função cn() para classes Tailwind
├── bmad/                # BMAD Method framework
├── components.json       # Configuração do shadcn/ui
├── tailwind.config.ts   # Configuração do Tailwind
└── package.json         # Dependências do projeto
```

## Componentes Comuns do Dashboard

Baseado no tema do tweakcn, você pode adicionar os seguintes componentes:

```bash
# Componentes base
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add input
npx shadcn@latest add label
npx shadcn@latest add select
npx shadcn@latest add checkbox
npx shadcn@latest add radio-group

# Componentes de navegação e layout
npx shadcn@latest add sidebar
npx shadcn@latest add navigation-menu
npx shadcn@latest add dropdown-menu

# Componentes de dados
npx shadcn@latest add table
npx shadcn@latest add data-table
npx shadcn@latest add chart

# Componentes de UI
npx shadcn@latest add dialog
npx shadcn@latest add sheet
npx shadcn@latest add toast
npx shadcn@latest add tooltip
npx shadcn@latest add popover
npx shadcn@latest add calendar
npx shadcn@latest add date-picker
```

## Customização do Tema

### Usando tweakcn.com

1. Acesse [tweakcn.com](https://tweakcn.com)
2. Crie ou selecione um tema
3. Exporte as variáveis CSS
4. Cole as variáveis em `app/globals.css` na seção `:root` ou `.dark`

### Manualmente

Edite as variáveis CSS em `app/globals.css`:

```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  /* ... outras variáveis ... */
}
```

## BMAD Method

Este template inclui o **BMAD Method** para desenvolvimento ágil com IA. Consulte a documentação em `bmad/.bmad-core/user-guide.md` para mais informações.

## Dicas

- Use o [tweakcn.com](https://tweakcn.com) para experimentar temas visuais antes de implementar
- Mantenha a estrutura de pastas consistente em todos os projetos
- Documente componentes customizados que você criar
- Use TypeScript para melhor tipagem e autocomplete

## Suporte

Para dúvidas sobre:
- **Next.js**: [nextjs.org/docs](https://nextjs.org/docs)
- **shadcn/ui**: [ui.shadcn.com](https://ui.shadcn.com)
- **Tailwind CSS**: [tailwindcss.com/docs](https://tailwindcss.com/docs)
- **tweakcn**: [tweakcn.com](https://tweakcn.com)

