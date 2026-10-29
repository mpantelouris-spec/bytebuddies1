import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

// Daltonise matrices (Machado 2009 simulation + Fidaner error shift): move the colour
// information a colour-blind child can't see into channels they can.
const CB_MATRICES = {
  protanopia: '1 0 0 0 0  0.479 0.477 0.044 0 0  0.597 -0.689 1.091 0 0  0 0 0 1 0',
  deuteranopia: '1 0 0 0 0  0.163 0.725 0.112 0 0  0.455 -0.645 1.191 0 0  0 0 0 1 0',
  tritanopia: '0.741 -0.407 0.666 0 0  0.075 0.585 0.340 0 0  0 0 1 0 0  0 0 0 1 0',
};

/** Hidden SVG filters that the colour-blind modes apply to the whole page (see index.css). */
function ColourBlindFilters() {
  return (
    <svg aria-hidden="true" focusable="false" width="0" height="0" style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }}>
      {Object.entries(CB_MATRICES).map(([id, values]) => (
        <filter key={id} id={`bb-cb-${id}`} colorInterpolationFilters="sRGB">
          <feColorMatrix type="matrix" values={values} />
        </filter>
      ))}
    </svg>
  );
}

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
      <ColourBlindFilters />
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
