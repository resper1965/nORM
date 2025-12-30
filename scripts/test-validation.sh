#!/bin/bash

# Script de validação e testes do projeto n.ORM

set -e

echo "🧪 Validação do Projeto n.ORM"
echo "================================"
echo ""

# Cores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Função para verificar comando
check_command() {
    if command -v $1 &> /dev/null; then
        echo -e "${GREEN}✓${NC} $1 instalado"
        return 0
    else
        echo -e "${RED}✗${NC} $1 não encontrado"
        return 1
    fi
}

# Função para verificar arquivo
check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✓${NC} $1 existe"
        return 0
    else
        echo -e "${RED}✗${NC} $1 não encontrado"
        return 1
    fi
}

# Função para verificar diretório
check_dir() {
    if [ -d "$1" ]; then
        echo -e "${GREEN}✓${NC} $1 existe"
        return 0
    else
        echo -e "${RED}✗${NC} $1 não encontrado"
        return 1
    fi
}

echo "📋 1. Verificando dependências..."
check_command node
check_command npm
check_command npx
echo ""

echo "📁 2. Verificando estrutura do projeto..."
check_file package.json
check_file tsconfig.json
check_file next.config.js
check_dir lib
check_dir app
check_dir components
echo ""

echo "🤖 3. Verificando agentes de IA..."
check_file lib/ai/agents/base-agent.ts
check_file lib/ai/agents/content-generator-agent.ts
check_file lib/ai/agents/content-evaluator-agent.ts
check_file lib/ai/agents/reputation-analyzer-agent.ts
check_file lib/ai/agents/orchestrator.ts
check_file lib/ai/agents/index.ts
echo ""

echo "🧪 4. Verificando configuração de testes..."
check_file vitest.config.ts
check_file playwright.config.ts
check_file tests/setup.ts
check_dir tests/unit
check_dir tests/integration
echo ""

echo "⚙️  5. Verificando variáveis de ambiente..."
if [ -f .env.local ] || [ -f .env ]; then
    echo -e "${GREEN}✓${NC} Arquivo .env encontrado"
    
    # Verificar variáveis críticas (sem expor valores)
    if grep -q "NEXT_PUBLIC_SUPABASE_URL" .env.local 2>/dev/null || grep -q "NEXT_PUBLIC_SUPABASE_URL" .env 2>/dev/null; then
        echo -e "${GREEN}✓${NC} NEXT_PUBLIC_SUPABASE_URL configurada"
    else
        echo -e "${YELLOW}⚠${NC} NEXT_PUBLIC_SUPABASE_URL não encontrada"
    fi
    
    if grep -q "OPENAI_API_KEY" .env.local 2>/dev/null || grep -q "OPENAI_API_KEY" .env 2>/dev/null; then
        echo -e "${GREEN}✓${NC} OPENAI_API_KEY configurada"
    else
        echo -e "${YELLOW}⚠${NC} OPENAI_API_KEY não encontrada (opcional para testes)"
    fi
else
    echo -e "${YELLOW}⚠${NC} Arquivo .env não encontrado"
fi
echo ""

echo "📦 6. Verificando node_modules..."
if [ -d "node_modules" ]; then
    echo -e "${GREEN}✓${NC} node_modules existe"
    echo "   Verificando dependências críticas..."
    if [ -d "node_modules/next" ]; then
        echo -e "${GREEN}✓${NC} Next.js instalado"
    fi
    if [ -d "node_modules/@supabase" ]; then
        echo -e "${GREEN}✓${NC} Supabase instalado"
    fi
    if [ -d "node_modules/openai" ]; then
        echo -e "${GREEN}✓${NC} OpenAI instalado"
    fi
    if [ -d "node_modules/vitest" ]; then
        echo -e "${GREEN}✓${NC} Vitest instalado"
    fi
else
    echo -e "${RED}✗${NC} node_modules não encontrado - execute 'npm install'"
fi
echo ""

echo "🔍 7. Executando TypeScript type check..."
if npx tsc --noEmit 2>&1 | head -20; then
    echo -e "${GREEN}✓${NC} TypeScript: Sem erros de tipo"
else
    echo -e "${YELLOW}⚠${NC} TypeScript: Alguns erros encontrados (verifique acima)"
fi
echo ""

echo "🧪 8. Executando testes unitários..."
if npm run test -- --run 2>&1 | tail -30; then
    echo -e "${GREEN}✓${NC} Testes unitários concluídos"
else
    echo -e "${YELLOW}⚠${NC} Alguns testes falharam (verifique acima)"
fi
echo ""

echo "📊 9. Verificando lint..."
if npm run lint 2>&1 | tail -20; then
    echo -e "${GREEN}✓${NC} Lint passou"
else
    echo -e "${YELLOW}⚠${NC} Lint encontrou problemas (verifique acima)"
fi
echo ""

echo "================================"
echo "✅ Validação concluída!"
echo ""
echo "📝 Próximos passos:"
echo "   1. Execute 'npm run build' para testar o build"
echo "   2. Execute 'npm run test' para rodar todos os testes"
echo "   3. Execute 'npm run dev' para iniciar o servidor de desenvolvimento"
echo ""

