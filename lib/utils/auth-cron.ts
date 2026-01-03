/**
 * Autenticação e autorização para cron jobs
 * Verifica CRON_SECRET do Vercel ou service role key do Supabase
 */

import { NextRequest } from 'next/server';
import { env } from '@/lib/config/env';

export class UnauthorizedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

/**
 * Verifica se a requisição está autorizada para executar cron jobs
 *
 * Métodos de autorização (em ordem de prioridade):
 * 1. Vercel Cron Secret (header: Authorization: Bearer CRON_SECRET)
 * 2. Supabase Service Role Key (header: Authorization: Bearer SERVICE_ROLE_KEY)
 * 3. Em desenvolvimento, permite sem autenticação (com warning)
 *
 * @param request - NextRequest object
 * @throws UnauthorizedError se não autorizado
 */
export function verifyCronAuth(request: NextRequest): void {
  const authHeader = request.headers.get('authorization');

  // Extrai o token do header "Authorization: Bearer TOKEN"
  const token = authHeader?.replace(/^Bearer\s+/i, '');

  // Método 1: Vercel Cron Secret
  if (env.CRON_SECRET && token === env.CRON_SECRET) {
    return; // Autorizado
  }

  // Método 2: Supabase Service Role Key
  if (env.SUPABASE_SERVICE_ROLE_KEY && token === env.SUPABASE_SERVICE_ROLE_KEY) {
    return; // Autorizado
  }

  // Método 3: Em desenvolvimento, permite mas avisa
  if (env.NODE_ENV === 'development') {
    console.warn(
      '\n⚠️  AVISO: Cron job executado sem autenticação em modo desenvolvimento.\n' +
      '   Em produção, configure CRON_SECRET ou use service role key.\n'
    );
    return; // Permitido em desenvolvimento
  }

  // Nenhum método de autenticação válido encontrado
  throw new UnauthorizedError(
    'Unauthorized: Missing or invalid authentication token. ' +
    'Please provide valid CRON_SECRET or service role key via Authorization header.'
  );
}

/**
 * Middleware helper para proteger rotas de cron
 * Uso:
 *
 * ```typescript
 * export async function POST(request: NextRequest) {
 *   verifyronAuth(request); // Lança erro se não autorizado
 *   // ... resto da lógica do cron
 * }
 * ```
 */
export function withCronAuth<T>(
  handler: (request: NextRequest) => Promise<T>
): (request: NextRequest) => Promise<T> {
  return async (request: NextRequest) => {
    verifyCronAuth(request);
    return handler(request);
  };
}
