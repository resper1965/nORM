export const locales = ['en', 'pt', 'es'] as const;
export const defaultLocale = 'pt' as const;

export type Locale = (typeof locales)[number];

