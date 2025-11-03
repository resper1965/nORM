#!/usr/bin/env node

/**
 * Script para verificar atualizações do BMAD Method
 * Executado automaticamente após clonar o repositório
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const BMAD_DIR = path.join(__dirname, '..', 'bmad');
const BMAD_REPO = 'https://github.com/bmad-method/bmad-method.git';
const BMAD_VERSION_FILE = path.join(BMAD_DIR, '.bmad-version');

console.log('🔍 Verificando atualizações do BMAD Method...\n');

// Verifica se o diretório bmad existe
if (!fs.existsSync(BMAD_DIR)) {
  console.log('⚠️  Diretório bmad não encontrado.');
  console.log('📦 O BMAD será baixado durante o setup.\n');
  process.exit(0);
}

// Lê versão atual se existir
let currentVersion = 'unknown';
if (fs.existsSync(BMAD_VERSION_FILE)) {
  try {
    currentVersion = fs.readFileSync(BMAD_VERSION_FILE, 'utf8').trim();
    console.log(`📌 Versão atual instalada: ${currentVersion}`);
  } catch (error) {
    console.log('⚠️  Não foi possível ler versão atual.');
  }
}

// Verifica se é um repositório git
const isGitRepo = fs.existsSync(path.join(BMAD_DIR, '.git'));

if (!isGitRepo) {
  console.log('⚠️  BMAD não é um repositório git. Não é possível verificar atualizações.\n');
  console.log('💡 Para habilitar verificações de atualização, o BMAD precisa ser um clone git.\n');
  process.exit(0);
}

try {
  // Busca informações do repositório remoto
  console.log('🌐 Verificando repositório remoto...');
  
  // Verifica se tem remote configurado
  try {
    const remoteUrl = execSync('git remote get-url origin', {
      cwd: BMAD_DIR,
      encoding: 'utf8',
      stdio: 'pipe'
    }).trim();
    
    console.log(`📍 Remote: ${remoteUrl}`);
    
    // Busca última versão disponível
    console.log('🔄 Buscando atualizações...');
    execSync('git fetch origin', {
      cwd: BMAD_DIR,
      stdio: 'inherit'
    });
    
    // Verifica commits à frente
    const status = execSync('git status -sb', {
      cwd: BMAD_DIR,
      encoding: 'utf8'
    });
    
    if (status.includes('behind')) {
      const behindCount = status.match(/behind (\d+)/)?.[1] || '0';
      console.log(`\n✨ Há ${behindCount} atualização(ões) disponível(is) para o BMAD Method!`);
      console.log('\n📝 Para atualizar, execute:');
      console.log('   npm run bmad:update\n');
      console.log('   ou manualmente:');
      console.log('   cd bmad && git pull origin main\n');
    } else {
      console.log('\n✅ BMAD Method está atualizado!\n');
    }
    
    // Atualiza arquivo de versão
    try {
      const latestCommit = execSync('git rev-parse HEAD', {
        cwd: BMAD_DIR,
        encoding: 'utf8'
      }).trim();
      
      const shortCommit = latestCommit.substring(0, 7);
      fs.writeFileSync(BMAD_VERSION_FILE, latestCommit);
      console.log(`📌 Versão atual: ${shortCommit}\n`);
    } catch (error) {
      // Ignora erro de versão
    }
    
  } catch (error) {
    console.log('⚠️  Não foi possível verificar atualizações automaticamente.');
    console.log('💡 Certifique-se de que o diretório bmad é um repositório git válido.\n');
  }
  
} catch (error) {
  console.log('⚠️  Erro ao verificar atualizações:', error.message);
  console.log('💡 Continue normalmente. O BMAD atual continuará funcionando.\n');
}

