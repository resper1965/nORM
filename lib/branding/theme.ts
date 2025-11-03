// Sistema de branding baseado em "ness"
// Mantém compatibilidade com tema claro/escuro e cores existentes

export interface BrandTheme {
  name: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    foreground: string;
  };
}

export const defaultBrandTheme: BrandTheme = {
  name: 'default',
  colors: {
    primary: '222.2 47.4% 11.2%',
    secondary: '210 40% 96.1%',
    accent: '210 40% 96.1%',
    background: '0 0% 100%',
    foreground: '222.2 84% 4.9%',
  },
};

// Tema "ness" - pode ser customizado mantendo estrutura
export const nessBrandTheme: BrandTheme = {
  name: 'ness',
  colors: {
    primary: '217 91% 60%',      // Azul Ness principal
    secondary: '210 40% 96.1%',  // Mantém secundária padrão
    accent: '217 70% 50%',       // Accent azul Ness
    background: '0 0% 100%',     // Mantém background claro
    foreground: '222.2 84% 4.9%', // Mantém foreground padrão
  },
};

export const nessDarkTheme: BrandTheme = {
  name: 'ness-dark',
  colors: {
    primary: '217 91% 70%',      // Azul Ness mais claro para dark
    secondary: '217.2 32.6% 17.5%',
    accent: '217 60% 45%',       // Accent ajustado para dark
    background: '222.2 84% 4.9%',
    foreground: '210 40% 98%',
  },
};

// Função para aplicar tema dinamicamente
export function applyBrandTheme(theme: BrandTheme, isDark: boolean = false) {
  const root = typeof document !== 'undefined' ? document.documentElement : null;
  if (!root) return;

  const colors = isDark && theme.name.includes('dark') 
    ? nessDarkTheme.colors 
    : theme.colors;

  root.style.setProperty('--primary', colors.primary);
  root.style.setProperty('--secondary', colors.secondary);
  root.style.setProperty('--accent', colors.accent);
  
  // Mantém compatibilidade com cores existentes
  if (isDark) {
    root.style.setProperty('--background', colors.background);
    root.style.setProperty('--foreground', colors.foreground);
  }
}

