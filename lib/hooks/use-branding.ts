"use client";

import { useEffect, useState } from 'react';
import { BrandTheme, defaultBrandTheme, nessBrandTheme, applyBrandTheme } from '@/lib/branding/theme';

export function useBranding() {
  const [theme, setTheme] = useState<BrandTheme>(defaultBrandTheme);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Verifica preferência do sistema ou localStorage
    const storedTheme = localStorage.getItem('brand-theme');
    const storedDark = localStorage.getItem('dark-mode') === 'true';
    
    if (storedTheme) {
      try {
        const parsedTheme = JSON.parse(storedTheme);
        setTheme(parsedTheme);
      } catch {
        setTheme(nessBrandTheme);
      }
    } else {
      setTheme(nessBrandTheme); // Tema padrão "ness"
    }

    setIsDark(storedDark || window.matchMedia('(prefers-color-scheme: dark)').matches);
  }, []);

  useEffect(() => {
    applyBrandTheme(theme, isDark);
  }, [theme, isDark]);

  const changeTheme = (newTheme: BrandTheme) => {
    setTheme(newTheme);
    localStorage.setItem('brand-theme', JSON.stringify(newTheme));
  };

  const toggleDarkMode = () => {
    const newDark = !isDark;
    setIsDark(newDark);
    localStorage.setItem('dark-mode', String(newDark));
    document.documentElement.classList.toggle('dark', newDark);
  };

  return {
    theme,
    isDark,
    changeTheme,
    toggleDarkMode,
  };
}

