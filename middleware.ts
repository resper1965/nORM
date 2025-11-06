import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './i18n/config';
import { updateSession } from './lib/supabase/middleware';
import { NextRequest } from 'next/server';

export const runtime = 'nodejs';

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'as-needed'
});

export default async function middleware(request: NextRequest) {
  // Atualiza sessão do Supabase (autenticação)
  const supabaseResponse = await updateSession(request);

  // Se o Supabase redirecionou (ex: para login), retorna a resposta de redirecionamento
  if (supabaseResponse.status === 307 || supabaseResponse.status === 308) {
    return supabaseResponse;
  }

  // Processa middleware de i18n e mantém os cookies do Supabase
  const intlResponse = intlMiddleware(request);
  
  // Copia cookies do Supabase para a resposta do i18n
  supabaseResponse.cookies.getAll().forEach((cookie) => {
    intlResponse.cookies.set(cookie.name, cookie.value);
  });

  return intlResponse;
}

export const config = {
  // Match all paths except static files and API routes
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
