import { MD3LightTheme as DefaultTheme } from 'react-native-paper';

export const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#2C5530',        // Forest green (prepper/survival theme)
    secondary: '#8B7355',      // Earthy brown
    tertiary: '#4A6B3E',       // Olive green
    background: '#F5F5F0',     // Off-white (easier on eyes)
    surface: '#FFFFFF',
    error: '#B00020',
    success: '#2E7D32',
    warning: '#F57C00',
    info: '#1976D2',
    onPrimary: '#FFFFFF',
    onSecondary: '#FFFFFF',
    onBackground: '#1C1B1F',
    onSurface: '#1C1B1F',
  },
  roundness: 8,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const fontSize = {
  xs: 10,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export type Theme = typeof theme;
