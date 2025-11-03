#!/bin/bash

# Script de setup do BMAD Method para o projeto ness-theme
# Executado automaticamente após npm install

set -e

BMAD_DIR="bmad"
BMAD_REPO="https://github.com/bmad-method/bmad-method.git"

echo "🚀 Configurando BMAD Method para ness-theme..."
echo ""

# Verifica se o diretório bmad já existe
if [ -d "$BMAD_DIR" ]; then
    echo "✅ Diretório bmad já existe."
    
    # Verifica se é um repositório git
    if [ -d "$BMAD_DIR/.git" ]; then
        echo "📦 BMAD já está configurado como repositório git."
        echo "🔄 Verificando atualizações..."
        
        cd "$BMAD_DIR"
        
        # Verifica se há atualizações disponíveis
        git fetch origin --quiet || true
        
        LOCAL=$(git rev-parse HEAD)
        REMOTE=$(git rev-parse origin/main 2>/dev/null || git rev-parse origin/master 2>/dev/null || echo "")
        
        if [ -n "$REMOTE" ] && [ "$LOCAL" != "$REMOTE" ]; then
            echo "✨ Há atualizações disponíveis para o BMAD Method!"
            echo ""
            echo "📝 Para atualizar, execute:"
            echo "   npm run bmad:update"
            echo ""
        else
            echo "✅ BMAD Method está atualizado!"
        fi
        
        cd ..
    else
        echo "⚠️  Diretório bmad existe mas não é um repositório git."
        echo "💡 Para habilitar verificações de atualização, converta para git:"
        echo "   cd bmad && git init && git remote add origin $BMAD_REPO"
        echo ""
    fi
else
    echo "📥 Clonando BMAD Method..."
    echo ""
    
    # Clona o repositório BMAD
    if git clone "$BMAD_REPO" "$BMAD_DIR" 2>/dev/null; then
        echo "✅ BMAD Method clonado com sucesso!"
        
        # Salva versão atual
        cd "$BMAD_DIR"
        COMMIT=$(git rev-parse HEAD)
        echo "$COMMIT" > .bmad-version
        SHORT_COMMIT=$(git rev-parse --short HEAD)
        echo "📌 Versão instalada: $SHORT_COMMIT"
        cd ..
        
        echo ""
        echo "✅ Setup do BMAD Method concluído!"
    else
        echo "⚠️  Não foi possível clonar o BMAD Method automaticamente."
        echo "💡 Você pode cloná-lo manualmente:"
        echo "   git clone $BMAD_REPO $BMAD_DIR"
        echo ""
    fi
fi

echo ""
echo "🔍 Executando verificação de atualizações..."
node scripts/check-bmad-updates.js

echo ""
echo "✅ Setup concluído!"

