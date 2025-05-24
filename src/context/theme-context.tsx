import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  isDarkMode: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Inicializar tema desde localStorage o usar 'system' como valor predeterminado
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme') as Theme;
      return savedTheme || 'system';
    }
    return 'system';
  });
  
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  // Efecto para aplicar el tema al DOM
  useEffect(() => {
    const root = window.document.documentElement;
    
    // Guardar preferencia en localStorage
    if (theme !== 'system') {
      localStorage.setItem('theme', theme);
    }
    
    // Determinar si debe usar modo oscuro
    const shouldUseDark = 
      theme === 'dark' || 
      (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    
    // Aplicar clases al elemento root
    if (shouldUseDark) {
      root.classList.add('dark');
      setIsDarkMode(true);
    } else {
      root.classList.remove('dark');
      setIsDarkMode(false);
    }
  }, [theme]);

  // Efecto para escuchar cambios en la preferencia del sistema
  useEffect(() => {
    if (theme !== 'system') return;
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = () => {
      setIsDarkMode(mediaQuery.matches);
      const root = window.document.documentElement;
      if (mediaQuery.matches) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  // Función memoizada para cambiar el tema
  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
  }, []);

  // Valor del contexto memoizado para evitar renderizaciones innecesarias
  const value = useMemo(() => ({
    theme,
    setTheme,
    isDarkMode
  }), [theme, setTheme, isDarkMode]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme debe ser usado dentro de un ThemeProvider');
  }
  return context;
};
