import { Platform, useColorScheme } from 'react-native';

// PLAN.md §7:主色珊瑚橘、近白背景、深色模式必做
export interface ThemeColors {
  primary: string;
  primarySoft: string;
  background: string;
  card: string;
  text: string;
  textSecondary: string;
  border: string;
  success: string;
  danger: string;
  zhText: string;
}

const light: ThemeColors = {
  primary: '#E8734A',
  primarySoft: '#FBE9E1',
  background: '#FAFAF8',
  card: '#FFFFFF',
  text: '#1A1A1A',
  textSecondary: '#7A7670',
  border: '#EAE7E1',
  success: '#3E9B6B',
  danger: '#C74B3F',
  zhText: '#5C574F',
};

const dark: ThemeColors = {
  primary: '#EF8A64',
  primarySoft: '#3A2A22',
  background: '#131211',
  card: '#1E1C1A',
  text: '#ECEAE6',
  textSecondary: '#9B968E',
  border: '#2E2B27',
  success: '#5BB98A',
  danger: '#E06C5F',
  zhText: '#B5AFA6',
};

export interface Theme {
  dark: boolean;
  colors: ThemeColors;
}

export function useTheme(): Theme {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  return { dark: isDark, colors: isDark ? dark : light };
}

// §7:英文用系統 serif 增加閱讀感
export const serifFont = Platform.select({
  ios: 'Georgia',
  android: 'serif',
  default: 'Georgia',
});

// §7:閱讀區字級 ≥ 17pt、行高 1.6
export const reading = {
  fontSize: 18,
  lineHeight: 18 * 1.6,
  zhFontSize: 15,
  zhLineHeight: 15 * 1.6,
};
