import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './i18n/config';
import { updateSession } from './lib/supabase/middleware';
import { NextRequest } from 'next/server';

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'as-needed'
});

export default async function middleware(request: NextRequest) {
  // Atualiza sessão do Supabase (autenticação)
  const supabaseResponse = await updateSession(request);

  // Processa middleware de i18n
  return intlMiddleware(request);
}

export const config = {
  // Match only internationalized pathnames
  matcher: ['/', '/(pt|en|es)/:path*']
};
