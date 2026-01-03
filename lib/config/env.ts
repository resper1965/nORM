/**
 * Validação de variáveis de ambiente com Zod
 * Garante que todas as variáveis necessárias estão presentes e válidas
 */

import { z } from 'zod';
import { logger } from '@/lib/utils/logger';

const requiredEnvVars = {
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY,
} as const;

// Schema para variáveis obrigatórias
// Permite valores padrão se as variáveis não estiverem definidas
const requiredEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().default('http://localhost:54321'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().default('dev-key-placeholder'),
});

// Schema para variáveis opcionais (mas recomendadas para produção)
const optionalEnvSchema = z.object({
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),
  SERPAPI_KEY: z.string().optional(),
  RESEND_API_KEY: z.string().optional(),
  CRON_SECRET: z.string().optional(),
  ENCRYPTION_KEY: z.string().optional(),
  NEXT_PUBLIC_APP_URL: z.string().url().default('http://localhost:3000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

// Combina schemas
const envSchema = requiredEnvSchema.merge(optionalEnvSchema);

// Função de validação
function validateEnv() {
  const envVars = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY:
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    SERPAPI_KEY: process.env.SERPAPI_KEY,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    CRON_SECRET: process.env.CRON_SECRET,
    ENCRYPTION_KEY: process.env.ENCRYPTION_KEY,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    NODE_ENV: process.env.NODE_ENV || 'development',
  };

  const result = envSchema.safeParse(envVars);

  if (!result.success) {
    // Zod 4.x types might not be fully compatible, using any as workaround
    const errors = (result.error as any).errors || result.error.issues || [];
    const missing = errors
      .map((e: any) => `  - ${e.path?.join?.('.') || 'unknown'}: ${e.message}`)
      .join('\n');
    throw new Error(
      `❌ Erro na validação de variáveis de ambiente:\n${missing}\n\n` +
      `💡 Copie .env.example para .env e preencha as variáveis necessárias.`
    );
  }

  return result.data;
}

// Validação em runtime (apenas servidor)
let validatedEnv: z.infer<typeof envSchema>;

if (typeof window === 'undefined') {
  try {
    validatedEnv = validateEnv();

    // Em desenvolvimento, avisa sobre variáveis opcionais faltando
    if (process.env.NODE_ENV === 'development') {
      const warnings: string[] = [];

      if (!validatedEnv.SUPABASE_SERVICE_ROLE_KEY) {
        warnings.push('SUPABASE_SERVICE_ROLE_KEY - necessária para operações admin');
      }
      if (!validatedEnv.OPENAI_API_KEY) {
        warnings.push('OPENAI_API_KEY - necessária para geração de conteúdo');
      }
      if (!validatedEnv.RESEND_API_KEY) {
        warnings.push('RESEND_API_KEY - necessária para envio de e-mails');
      }
      if (!validatedEnv.CRON_SECRET) {
        warnings.push('CRON_SECRET - recomendada para segurança dos cron jobs');
      }

      if (warnings.length > 0) {
        console.warn(
          '\n⚠️  Variáveis opcionais não configuradas:\n' +
          warnings.map(w => `  - ${w}`).join('\n') +
          '\n💡 Algumas funcionalidades podem não funcionar completamente.\n'
        );
      }
    }
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error(error);
      // Em desenvolvimento, continua mesmo com erro para permitir exploração
      validatedEnv = {
        NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
        NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
        NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
        NODE_ENV: 'development',
      } as z.infer<typeof envSchema>;
    } else {
      // Em produção, falha hard
      throw error;
    }
  }
} else {
  // No cliente, apenas usa as variáveis públicas
  validatedEnv = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    NODE_ENV: process.env.NODE_ENV as 'development' | 'production' | 'test' || 'development',
  } as z.infer<typeof envSchema>;
}

export const env = validatedEnv!;
