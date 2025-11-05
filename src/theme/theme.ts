import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';

export const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#D32F2F',
    secondary: '#F57C00',
    tertiary: '#388E3C',
    background: '#f5f5f5',
    surface: '#ffffff',
    error: '#B00020',
  },
};

export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#EF5350',
    secondary: '#FF9800',
    tertiary: '#4CAF50',
    background: '#121212',
    surface: '#1E1E1E',
    error: '#CF6679',
  },
};
