import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => localStorage.getItem('cv-theme') || 'dark');
  const [colorblindMode, setColorblindMode] = useState(() => localStorage.getItem('cv-colorblind') || 'none');
  const [highContrast, setHighContrast] = useState(() => localStorage.getItem('cv-hc') === 'true');
  const [dyslexicFont, setDyslexicFont] = useState(() => localStorage.getItem('cv-dyslexic') === 'true');
  const [blockColorTheme, setBlockColorTheme] = useState(() => localStorage.getItem('cv-blocktheme') || 'default');

  useEffect(() => {
    const el = document.documentElement;
    el.setAttribute('data-theme', theme);
    el.setAttribute('data-colorblind', colorblindMode);
    el.setAttribute('data-highcontrast', highContrast ? 'true' : 'false');
    el.setAttribute('data-dyslexic', dyslexicFont ? 'true' : 'false');
    el.setAttribute('data-blocktheme', blockColorTheme);
    localStorage.setItem('cv-theme', theme);
    localStorage.setItem('cv-colorblind', colorblindMode);
    localStorage.setItem('cv-hc', highContrast);
    localStorage.setItem('cv-dyslexic', dyslexicFont);
    localStorage.setItem('cv-blocktheme', blockColorTheme);
  }, [theme, colorblindMode, highContrast, dyslexicFont, blockColorTheme]);

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark');

  return (
    <ThemeContext.Provider value={{
      theme,
      toggleTheme,
      colorblindMode,
      setColorblindMode,
      highContrast,
      setHighContrast,
      dyslexicFont,
      setDyslexicFont,
      blockColorTheme,
      setBlockColorTheme,
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
