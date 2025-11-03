# Ness Theme - Template Base

Template base para projetos futuros criado a partir do tema [tweakcn dashboard](https://tweakcn.com/themes/cmhf58ysi000304l8eexg3lzq).

## 🎨 Branding "Ness"

Este template usa o branding "Ness" como tema principal, mantendo compatibilidade com modo claro/escuro.

## Stack Tecnológica

- **Next.js 14** - Framework React com App Router
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização utilitária
- **shadcn/ui** - Componentes UI acessíveis e customizáveis
- **next-intl** - Sistema multiidiomas nativo
- **Supabase** - Backend como serviço integrado
- **BMAD Method** - Framework de desenvolvimento ágil com IA

## 🚀 Instalação

```bash
# Clonar o repositório
git clone <repo-url> ness-theme
cd ness-theme

# Instalar dependências (setup do BMAD executa automaticamente)
npm install
```

O script `postinstall` executa automaticamente o setup do BMAD Method e verifica atualizações.

## 📦 BMAD Method

O BMAD Method está incluído no repositório e será verificado automaticamente:

- ✅ **Incluído no repositório**: O diretório `bmad/` faz parte do projeto
- ✅ **Verificação automática**: Após `npm install`, verifica atualizações
- ✅ **Atualização manual**: Execute `npm run bmad:update` quando necessário

### Comandos BMAD

```bash
# Verificar atualizações disponíveis
npm run bmad:check

# Atualizar BMAD para última versão
npm run bmad:update

# Setup manual do BMAD (se necessário)
npm run setup
```

## 🌍 Multiidiomas (i18n)

O projeto suporta nativamente múltiplos idiomas:
- 🇧🇷 Português (pt) - Padrão
- 🇺🇸 Inglês (en)
- 🇪🇸 Espanhol (es)

Ver [README-CONFIG.md](./README-CONFIG.md) para mais detalhes.

## 🗄️ Supabase

Supabase está pré-configurado para todas as funcionalidades.

1. Crie um projeto no [Supabase](https://supabase.com)
2. Copie `.env.example` para `.env.local`
3. Preencha as credenciais

Ver [SUPABASE-SETUP.md](./SUPABASE-SETUP.md) para instruções completas.

## Desenvolvimento

### Opção 1: Usando npm (local)

```bash
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) no seu navegador.

### Opção 2: Usando Docker (recomendado)

Certifique-se de que o Docker Desktop está rodando, depois:

```bash
# Usar docker-compose para desenvolvimento
docker-compose up

# Ou rodar em background
docker-compose up -d
```

O projeto estará disponível em [http://localhost:3000](http://localhost:3000).

Para mais informações sobre Docker, consulte [README-DOCKER.md](./README-DOCKER.md).

## Adicionar Componentes shadcn/ui

```bash
npx shadcn@latest add [component-name]
```

## Estrutura do Projeto

```
├── app/[locale]/         # App Router do Next.js (multiidiomas)
├── components/           # Componentes React
│   ├── ui/              # Componentes shadcn/ui
│   ├── dashboard/       # Componentes do dashboard
│   └── lib/             # Componentes customizados
├── lib/                 # Utilitários
│   ├── supabase/        # Clientes Supabase
│   └── branding/        # Sistema de branding
├── i18n/                # Configuração e traduções
├── bmad/                # BMAD Method framework
├── scripts/             # Scripts de setup e manutenção
└── docker-compose.yml   # Configuração Docker
```

## Uso como Template

Este projeto foi configurado para ser usado como base para novos projetos:

1. Clone este repositório
2. Renomeie o diretório para o nome do novo projeto
3. Atualize o `package.json` com o novo nome
4. Execute `npm install` para configurar BMAD
5. Configure Supabase (ver [SUPABASE-SETUP.md](./SUPABASE-SETUP.md))
6. Comece a desenvolver!

## 📚 Documentação Adicional

- [README-CONFIG.md](./README-CONFIG.md) - Configurações detalhadas (i18n, Supabase, Branding)
- [README-DOCKER.md](./README-DOCKER.md) - Setup e uso com Docker
- [SUPABASE-SETUP.md](./SUPABASE-SETUP.md) - Guia completo de setup Supabase
- [TEMPLATE.md](./TEMPLATE.md) - Guia de uso como template

## Referências

- [Next.js Documentation](https://nextjs.org/docs)
- [shadcn/ui Components](https://ui.shadcn.com/)
- [bundui/ui Repository](https://github.com/bundui/ui) - Fork do shadcn/ui com referências adicionais
- [Tailwind CSS](https://tailwindcss.com/docs)
- [tweakcn](https://tweakcn.com/) - Editor visual de temas
- [BMAD Method](https://github.com/bmad-method/bmad-method) - Framework de desenvolvimento ágil

## 🔄 Atualizações Automáticas

Após clonar o repositório:
1. `npm install` executa automaticamente o setup do BMAD
2. Verifica se há atualizações disponíveis
3. Notifica se houver novas versões

Para atualizar manualmente:
```bash
npm run bmad:update
```
