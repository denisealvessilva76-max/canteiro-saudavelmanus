#!/bin/bash

# Script de deployment para GitHub Pages
# Uso: ./scripts/deploy-gh-pages.sh

set -e

echo "🚀 Iniciando deployment para GitHub Pages..."

# Verificar se estamos em um repositório Git
if [ ! -d ".git" ]; then
    echo "❌ Erro: Não é um repositório Git"
    exit 1
fi

# Obter informações do repositório
REPO_URL=$(git config --get remote.origin.url)
REPO_NAME=$(basename "$REPO_URL" .git)
GITHUB_USER=$(git config --get user.name)

echo "📦 Repositório: $REPO_NAME"
echo "👤 Usuário: $GITHUB_USER"

# Limpar build anterior
echo "🧹 Limpando build anterior..."
rm -rf dist-web dist

# Instalar dependências
echo "📥 Instalando dependências..."
pnpm install

# Compilar para web
echo "🔨 Compilando para web..."
pnpm build

# Criar branch temporário para deployment
DEPLOY_BRANCH="gh-pages-deploy-$(date +%s)"
echo "📝 Criando branch temporário: $DEPLOY_BRANCH"
git checkout -b "$DEPLOY_BRANCH"

# Adicionar arquivos de build
echo "📤 Adicionando arquivos de build..."
git add dist-web/ -f
git commit -m "chore: build web para GitHub Pages [skip ci]" || echo "Nenhuma mudança para commit"

# Fazer push para gh-pages
echo "🌐 Fazendo push para gh-pages..."
git push origin "$DEPLOY_BRANCH:gh-pages" -f

# Voltar para main
echo "🔄 Voltando para main..."
git checkout main
git branch -D "$DEPLOY_BRANCH"

echo "✅ Deployment concluído com sucesso!"
echo "📍 Seu app está disponível em: https://$GITHUB_USER.github.io/$REPO_NAME/"
