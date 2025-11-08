import React from 'react';

export const ThemeProvider = ({ children }) => {
  return (
    <div className="text-neutral-900 antialiased">
      {children}
    </div>
  );
};

export default ThemeProvider;