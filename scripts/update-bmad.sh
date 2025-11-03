#!/bin/bash

# Script para atualizar o BMAD Method
# Executa: npm run bmad:update

set -e

BMAD_DIR="bmad"

echo "🔄 Atualizando BMAD Method..."
echo ""

if [ ! -d "$BMAD_DIR" ]; then
    echo "❌ Diretório bmad não encontrado!"
    echo "💡 Execute primeiro: npm run setup"
    exit 1
fi

if [ ! -d "$BMAD_DIR/.git" ]; then
    echo "❌ BMAD não é um repositório git!"
    echo "💡 Não é possível atualizar automaticamente."
    exit 1
fi

cd "$BMAD_DIR"

echo "📥 Buscando atualizações do repositório remoto..."
git fetch origin

LOCAL=$(git rev-parse HEAD)
REMOTE=$(git rev-parse origin/main 2>/dev/null || git rev-parse origin/master 2>/dev/null || echo "origin/HEAD")

if [ -z "$REMOTE" ]; then
    echo "⚠️  Não foi possível determinar branch remota."
    REMOTE="origin/HEAD"
fi

REMOTE_COMMIT=$(git rev-parse "$REMOTE" 2>/dev/null || echo "")

if [ -z "$REMOTE_COMMIT" ]; then
    echo "⚠️  Não foi possível acessar repositório remoto."
    echo "💡 Verifique sua conexão ou configure o remote:"
    echo "   git remote add origin https://github.com/bmad-method/bmad-method.git"
    exit 1
fi

if [ "$LOCAL" == "$REMOTE_COMMIT" ]; then
    echo "✅ BMAD Method já está na versão mais recente!"
    cd ..
    exit 0
fi

echo "✨ Atualizações encontradas!"
echo ""
echo "📊 Mudanças:"
git log --oneline "$LOCAL".."$REMOTE" | head -10 || true
echo ""

read -p "Deseja atualizar agora? (s/N) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Ss]$ ]]; then
    echo "❌ Atualização cancelada."
    cd ..
    exit 0
fi

echo "🔄 Aplicando atualizações..."
git merge "$REMOTE" --no-edit || git pull origin main || git pull origin master

COMMIT=$(git rev-parse HEAD)
echo "$COMMIT" > .bmad-version
SHORT_COMMIT=$(git rev-parse --short HEAD)

echo ""
echo "✅ BMAD Method atualizado!"
echo "📌 Nova versão: $SHORT_COMMIT"
echo ""

cd ..

