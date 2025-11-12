/**
 * Theme utility functions and hooks
 * Helper functions to work with the modular theme system
 */

import { THEME_COLORS, LAYOUT, THEME_METADATA, type ThemeName } from '@/types/theme';

/**
 * Get combined theme object with all configuration
 */
export function getThemeConfig(themeName: ThemeName) {
  return {
    name: themeName,
    metadata: THEME_METADATA[themeName],
    colors: THEME_COLORS[themeName],
    layout: LAYOUT,
  };
}

/**
 * Apply layout class directly to JSX className
 * Helper to make it easier to use layout definitions
 * 
 * @example
 * <div className={applyLayout('stats.container')}>
 */
export function applyLayout(path: string): string {
  const keys = path.split('.');
  let obj: any = LAYOUT;
  
  for (const key of keys) {
    obj = obj[key];
    if (!obj) return '';
  }
  
  return typeof obj === 'string' ? obj : '';
}

/**
 * Get all available themes
 */
export function getAvailableThemes(): ThemeName[] {
  return Object.keys(THEME_COLORS) as ThemeName[];
}

/**
 * Validate if a theme name is valid
 */
export function isValidTheme(theme: unknown): theme is ThemeName {
  return typeof theme === 'string' && theme in THEME_COLORS;
}

/**
 * Get theme display name and icon
 */
export function getThemeDisplay(themeName: ThemeName) {
  const metadata = THEME_METADATA[themeName];
  return `${metadata.icon} ${metadata.name}`;
}

/**
 * Get responsive class string for given layout section
 */
export function getLayoutClass(section: keyof typeof LAYOUT, property?: string): string {
  const sectionConfig = LAYOUT[section];
  if (property && typeof sectionConfig === 'object' && property in sectionConfig) {
    return (sectionConfig as Record<string, string>)[property];
  }
  if (typeof sectionConfig === 'string') {
    return sectionConfig;
  }
  return '';
}

/**
 * Merge layout styles with color styles
 * Useful for applying both layout and theme colors in one go
 */
export function getThemedElement(
  layoutPath: string,
  themeName: ThemeName,
  colorProperty: keyof typeof THEME_COLORS[ThemeName] = 'textPrimary'
) {
  return {
    className: applyLayout(layoutPath),
    style: {
      color: THEME_COLORS[themeName][colorProperty],
    },
  };
}

/**
 * Get language gradient colors for given theme
 */
export function getLanguageGradientColors(themeName: ThemeName) {
  const colors = THEME_COLORS[themeName];
  return {
    lang1: {
      start: colors.accent,
      end: themeName === 'minimal' ? '#f9a8d4' : 
            themeName === 'retro' ? '#f9a8d4' : 
            themeName === 'sunset' ? colors.accentSecondary : 
            colors.accentSecondary,
    },
    lang2: {
      start: themeName === 'retro' ? '#06b6d4' : '#6366f1',
      end: themeName === 'retro' ? '#38bdf8' : '#a78bfa',
    },
    lang3: {
      start: '#f59e0b',
      end: '#fbbf24',
    },
  };
}

/**
 * Get background bar color for languages section
 */
export function getLanguageBarBgColor(themeName: ThemeName): string {
  const colors = THEME_COLORS[themeName];
  
  if (themeName === 'minimal') {
    return 'rgba(226, 232, 240, 1)';
  } else if (themeName === 'retro') {
    return 'rgba(131, 24, 67, 0.5)';
  } else if (themeName === 'sunset') {
    return 'rgba(63, 63, 70, 0.5)';
  }
  
  return 'rgba(55, 65, 81, 0.5)';
}

/**
 * Type-safe theme color access
 */
export function getThemeColor(
  themeName: ThemeName,
  colorKey: keyof typeof THEME_COLORS[ThemeName]
): string {
  return THEME_COLORS[themeName][colorKey];
}

/**
 * Check if theme is light or dark
 */
export function isLightTheme(themeName: ThemeName): boolean {
  return themeName === 'minimal';
}

/**
 * Get appropriate text color for theme
 */
export function getThemeTextColor(themeName: ThemeName, variant: 'primary' | 'secondary' = 'primary'): string {
  const colors = THEME_COLORS[themeName];
  return variant === 'primary' ? colors.textPrimary : colors.textSecondary;
}

/**
 * Get stat box colors for theme
 */
export function getStatBoxColors(themeName: ThemeName) {
  const colors = THEME_COLORS[themeName];
  return {
    bg: colors.statBg,
    border: colors.statBorder,
    text: colors.textPrimary,
    label: colors.textSecondary,
  };
}
