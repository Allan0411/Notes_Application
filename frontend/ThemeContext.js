// frontend/ThemeContext.js
import React, { createContext, useState, useEffect } from 'react';
import { Appearance } from 'react-native';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const colorScheme = Appearance.getColorScheme(); // 'light' or 'dark'

  const [themeMode, setThemeMode] = useState('system'); // 'light' | 'dark' | 'system'
  const [activeTheme, setActiveTheme] = useState(colorScheme || 'light');

  useEffect(() => {
    if (themeMode === 'system') {
      setActiveTheme(colorScheme);
    } else {
      setActiveTheme(themeMode);
    }
  }, [themeMode, colorScheme]);

  return (
    <ThemeContext.Provider value={{ themeMode, setThemeMode, activeTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
