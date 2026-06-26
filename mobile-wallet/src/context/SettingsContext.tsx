import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Language } from '../translations';

interface SettingsContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  didacticEnabled: boolean;
  setDidacticEnabled: (val: boolean) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLang] = useState<Language>(() => {
    return (localStorage.getItem('app_lang') as Language) || 'fr';
  });
  
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('app_theme') as 'light' | 'dark') || 'dark';
  });

  const [didacticEnabled, setDidacticEnabled] = useState<boolean>(() => {
    return localStorage.getItem('app_didactic') !== 'false';
  });

  useEffect(() => {
    localStorage.setItem('app_lang', lang);
  }, [lang]);

  useEffect(() => {
    localStorage.setItem('app_theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('app_didactic', String(didacticEnabled));
  }, [didacticEnabled]);

  // Enforce body style update
  useEffect(() => {
      document.body.className = theme === 'light' ? 'light-mode' : '';
  }, [theme]);

  return (
    <SettingsContext.Provider value={{ lang, setLang, theme, setTheme, didacticEnabled, setDidacticEnabled }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
