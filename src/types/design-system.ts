export type ColorVariant = 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'error';
export type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
export type Spacing = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
export type BorderRadius = 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | 'full';

export interface DesignToken {
  colors: Record<ColorVariant, string>;
  spacing: Record<Spacing, string>;
  borderRadius: Record<BorderRadius, string>;
  typography: Record<Size, string>;
}

export interface ComponentVariant {
  base: string;
  variants: Record<string, string>;
  sizes: Record<Size, string>;
}

export interface AnimationConfig {
  duration: number;
  easing: string;
  delay?: number;
}

export interface ThemeConfig {
  mode: 'light' | 'dark';
  tokens: DesignToken;
  animations: {
    enabled: boolean;
    preference: 'full' | 'reduced' | 'none';
  };
}
