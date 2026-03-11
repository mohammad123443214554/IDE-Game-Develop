import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext({});

export const themes = {
  'dark-pro': { name: 'Dark Pro', icon: '⬛' },
  'midnight-blue': { name: 'Midnight Blue', icon: '🌙' },
  'cyber-purple': { name: 'Cyber Purple', icon: '🟣' },
  'neon-tech': { name: 'Neon Tech', icon: '💚' },
  'light-minimal': { name: 'Light Minimal', icon: '☀️' },
  'matrix-green': { name: 'Matrix Green', icon: '💻' },
};

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('dark-pro');

  useEffect(() => {
    const saved = localStorage.getItem('theme') || 'dark-pro';
    setTheme(saved);
    document.documentElement.setAttribute('data-theme', saved);
  }, []);

  const changeTheme = (t) => {
    setTheme(t);
    localStorage.setItem('theme', t);
    document.documentElement.setAttribute('data-theme', t);
  };

  return (
    <ThemeContext.Provider value={{ theme, changeTheme, themes }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
