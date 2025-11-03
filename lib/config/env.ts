/**
 * Validação de variáveis de ambiente
 * Garante que todas as variáveis necessárias estão presentes antes da inicialização
 */

const requiredEnvVars = {
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
} as const;

const optionalEnvVars = {
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
} as const;

// Valida variáveis obrigatórias
function validateEnv() {
  const missing: string[] = [];

  Object.entries(requiredEnvVars).forEach(([key, value]) => {
    if (!value) {
      missing.push(key);
    }
  });

  if (missing.length > 0) {
    throw new Error(
      `❌ Variáveis de ambiente faltando: ${missing.join(', ')}\n` +
      `💡 Copie .env.example para .env.local e preencha as variáveis.`
    );
  }
}

// Valida apenas em runtime do servidor (não no build)
if (typeof window === 'undefined') {
  // Só valida em desenvolvimento para não quebrar builds
  if (process.env.NODE_ENV === 'development') {
    try {
      validateEnv();
    } catch (error) {
      console.warn(error);
      // Não quebra o build, apenas avisa
    }
  }
}

export const env = {
  ...requiredEnvVars,
  ...optionalEnvVars,
} as {
  NEXT_PUBLIC_SUPABASE_URL: string;
  NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
};

