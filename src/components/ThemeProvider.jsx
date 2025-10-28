import React, { createContext, useContext, useEffect, useState } from 'react';

// Default theme is 'light' (white)
const ThemeContext = createContext({ theme: 'light', setTheme: () => {}, toggleTheme: () => {} });

export default function ThemeProvider({ children }) {
  // Force the whole app to use light theme only.
  // Ignore any saved preference and keep a stable 'light' theme.
  const [theme] = useState('light');

  useEffect(() => {
    try {
      localStorage.setItem('theme', theme);
    } catch (e) {}
    // Set theme on HTML element for CSS usage
    // Many styles in the project use class selectors like `.theme-light` / `.theme-dark`
    // so keep a matching class on the root element in addition to the
    // data-theme attribute. This ensures the default 'light' theme (white)
    // applies correctly.
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.classList.remove('theme-light', 'theme-dark');
    document.documentElement.classList.add(`theme-${theme}`);
  }, [theme]);

  // Theme toggling disabled — app is always light.
  const toggleTheme = () => {};

  return (
    // Expose a no-op setter so consumers can't change the global theme.
    <ThemeContext.Provider value={{ theme, setTheme: () => {}, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// Custom hook to access theme
export function useTheme() {
  return useContext(ThemeContext);
}
