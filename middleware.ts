import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './i18n/config';
import { NextRequest, NextResponse } from 'next/server';

// Middleware para i18n
const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'as-needed'
});

// Security headers (complementa os do vercel.json)
const securityHeaders = [
  // Rate limiting hint (não faz rate limiting real, apenas informa)
  {
    key: 'X-RateLimit-Limit',
    value: '100'
  },
  // Security headers adicionais
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY'
  }
];

export default function middleware(request: NextRequest) {
  // Execute i18n middleware
  const response = intlMiddleware(request);

  // Add security headers to response
  securityHeaders.forEach(({ key, value }) => {
    response.headers.set(key, value);
  });

  // Add CSP nonce for inline scripts (opcional, para uso futuro)
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64');
  response.headers.set('x-nonce', nonce);

  return response;
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
