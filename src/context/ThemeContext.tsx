import React, { createContext, useContext, ReactNode } from 'react';
import { Colors, ColorsType } from '../units/Colors';

interface ThemeContextType {
  colors: ColorsType;
}

const ThemeContext = createContext<ThemeContextType>({
  colors: Colors,
});

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  return (
    <ThemeContext.Provider value={{ colors: Colors }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  return context ?? { colors: Colors };
};

export default ThemeContext;
