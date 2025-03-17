import React, { createContext, useState, useContext, useEffect } from 'react';
import { lightTheme, darkTheme } from './theme';
import {useColorScheme} from 'react-native';


const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  
  const colorScheme = useColorScheme();
  const [theme, setTheme] = useState(colorScheme === 'dark' ? darkTheme : lightTheme);
  
  useEffect(() => {
    setTheme(colorScheme === 'dark' ? darkTheme : lightTheme);
  }, [colorScheme]);
  
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
