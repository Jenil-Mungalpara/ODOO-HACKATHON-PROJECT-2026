import { createContext, useContext, useState, useEffect } from 'react';

export const tokens = {
  primary: '#1a73e8',
  surface: '#ffffff',
  muted: '#f1f3f4',
  text: '#202124',
  textMuted: '#5f6368',
  success: '#0d904f',
  warning: '#e37400',
  danger: '#ea4335',
  accent: '#018786',
  border: '#dadce0',
  borderLight: '#e8eaed',
  radius: '8px',
  font: "'Inter', 'Roboto', -apple-system, sans-serif",
  baseFontSize: '16px',
  lineHeight: 1.4,
  spacing: 8, // baseline in px
};

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [mode, setMode] = useState(() => localStorage.getItem('fleetflow_theme') || 'light');

  useEffect(() => {
    localStorage.setItem('fleetflow_theme', mode);
    document.documentElement.setAttribute('data-theme', mode);
  }, [mode]);

  const toggleTheme = () => setMode(m => m === 'light' ? 'dark' : 'light');

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme, tokens }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
