/**
 * Comprehensive Theme System
 * Separates layout/sizing/typography from colors
 * Colors only change per theme, everything else is consistent
 */

export type ThemeName = 'space' | 'sunset' | 'retro' | 'minimal' | 'high-contrast';

/**
 * Color configuration - changes per theme
 */
export interface ThemeColors {
  bg: string; // Page background
  cardBg: string; // Card background
  border: string; // Card border
  accent: string; // Primary accent color
  accentSecondary: string; // Secondary accent for gradients
  glow: string; // Glow effect color
  avatar: string; // Avatar border color
  statBg: string; // Stats box background
  statBorder: string; // Stats box border
  textPrimary: string; // Primary text color
  textSecondary: string; // Secondary text color
  iconColor: string; // Icon color
}

/**
 * Layout configuration - consistent across all themes
 * This centralizes all sizing, padding, margins, fonts, etc.
 */
export const LAYOUT = {
  // Page/Container
  page: {
    minHeight: 'min-h-screen',
    padding: 'px-4',
    display: 'flex items-center justify-center',
  },

  // Header Section
  header: {
    marginBottom: 'mb-8',
    textAlign: 'text-center',
    titleSize: 'text-3xl sm:text-4xl',
    titleFont: 'font-bold',
    subtitleSize: 'text-3xl sm:text-4xl',
  },

  // Grid Layout
  grid: {
    mainGrid: 'grid grid-cols-1 lg:grid-cols-5 gap-8 xl:gap-12 items-start',
    leftColumn: 'lg:col-span-3',
    rightColumn: 'lg:col-span-2',
  },

  // Card Container
  card: {
    padding: 'p-6 sm:p-8',
    border: 'border',
    borderRadius: 'rounded-3xl',
    backdrop: 'backdrop-blur-lg',
    overflow: 'overflow-hidden',
  },

  // Avatar Section
  avatar: {
    container: 'flex flex-col sm:flex-row items-center gap-4 sm:gap-5 mb-6 sm:mb-8',
    image: 'w-20 h-20 rounded-full border-4 shadow-lg',
    textContainer: 'text-center sm:text-left',
    nameSize: 'text-xl sm:text-2xl',
    nameFont: 'font-bold',
    usernameSize: 'text-sm sm:text-base',
  },

  // Stats Grid
  stats: {
    container: 'grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mb-5 sm:mb-6',
    box: 'border p-2.5 sm:p-3 rounded-xl text-center flex flex-col items-center justify-center',
    label: 'text-[10px] sm:text-xs uppercase tracking-wider mb-0.5',
    value: 'text-2xl sm:text-3xl font-bold',
  },

  // Activity Insights
  activityInsights: {
    container: 'border p-3 sm:p-4 rounded-xl',
    title: 'text-sm sm:text-base font-bold mb-1.5 sm:mb-2 flex items-center gap-2',
    label: 'text-[11px] sm:text-xs uppercase tracking-wider mb-0.5 sm:mb-1',
    value: 'text-xs sm:text-sm',
  },

  // Languages Section
  languages: {
    container: 'border p-3 sm:p-4 rounded-xl',
    title: 'text-sm sm:text-base font-bold mb-2 sm:mb-3 flex items-center gap-2',
    item: 'flex items-center gap-2 sm:gap-3',
    label: 'text-xs sm:text-sm font-mono w-16 sm:w-20 text-right',
    bar: 'relative flex-1 h-2 sm:h-3 rounded-full overflow-hidden',
    percentage: 'text-xs sm:text-sm w-8 sm:w-10 text-right font-semibold',
  },

  // Top Repository
  topRepo: {
    container: 'border p-3 sm:p-4 rounded-xl',
    title: 'text-sm sm:text-base font-bold mb-1.5 sm:mb-2 flex items-center gap-2',
    repoBox: 'flex items-center gap-2 sm:gap-3',
    circleIcon: 'w-8 h-8 rounded-full flex items-center justify-center font-bold text-white shadow-lg text-sm',
    repoName: 'font-medium text-sm sm:text-base',
    contributions: 'text-xs sm:text-sm',
  },

  // Theme Selector
  themeSelector: {
    container: 'border backdrop-blur-lg rounded-2xl p-6',
    title: 'text-lg font-bold mb-4 flex items-center gap-2',
    grid: 'grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-4',
    button: 'group flex flex-col items-center gap-2 p-2 rounded-lg transition-colors',
    preview: 'w-full h-10 rounded-md',
    label: 'text-sm',
  },

  // Action Buttons
  actions: {
    container: 'space-y-4',
    downloadContainer: 'relative',
    buttonGrid: 'grid grid-cols-1 sm:grid-cols-3 gap-4',
    button: 'group col-span-1 sm:col-span-3 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 font-semibold transition-all active:scale-[0.98]',
    smallButton: 'flex w-full items-center justify-center gap-2 rounded-lg border-2 transition-all',
  },

  // Typography
  typography: {
    h1: 'text-3xl font-bold sm:text-4xl',
    h2: 'text-xl sm:text-2xl font-bold',
    h3: 'text-lg font-bold',
    body: 'text-sm',
    small: 'text-xs',
  },

  // Background patterns
  background: {
    dotSize: '24px',
    gridSize: '2rem',
  },
} as const;

/**
 * All theme color configurations
 */
export const THEME_COLORS: Record<ThemeName, ThemeColors> = {
  space: {
    bg: 'linear-gradient(to bottom, #1e1b4b, #312e81)',
    cardBg: 'rgba(31, 41, 55, 0.6)',
    border: '#374151',
    accent: '#14b8a6',
    accentSecondary: '#6366f1',
    glow: 'rgba(20, 184, 166, 0.2)',
    avatar: '#60a5fa',
    statBg: 'rgba(17, 24, 39, 0.5)',
    statBorder: '#374151',
    textPrimary: '#ffffff',
    textSecondary: '#9ca3af',
    iconColor: '#2dd4bf',
  },
  sunset: {
    bg: 'linear-gradient(to bottom, #7c2d12, #991b1b)',
    cardBg: 'rgba(39, 39, 42, 0.6)',
    border: '#3f3f46',
    accent: '#f97316',
    accentSecondary: '#ec4899',
    glow: 'rgba(249, 115, 22, 0.2)',
    avatar: '#f97316',
    statBg: 'rgba(24, 24, 27, 0.5)',
    statBorder: '#3f3f46',
    textPrimary: '#ffffff',
    textSecondary: '#a1a1aa',
    iconColor: '#ec4899',
  },
  retro: {
    bg: 'linear-gradient(to bottom, #110e19, #1a1625)',
    cardBg: 'rgba(0, 0, 0, 0.8)',
    border: 'rgba(236, 72, 153, 0.3)',
    accent: '#ec4899',
    accentSecondary: '#06b6d4',
    glow: 'rgba(236, 72, 153, 0.3)',
    avatar: '#ec4899',
    statBg: 'rgba(80, 7, 36, 0.4)',
    statBorder: 'rgba(236, 72, 153, 0.4)',
    textPrimary: '#ffffff',
    textSecondary: '#f9a8d4',
    iconColor: '#06b6d4',
  },
  minimal: {
    bg: 'linear-gradient(to bottom, #f8fafc, #f1f5f9)',
    cardBg: 'rgba(255, 255, 255, 1)',
    border: '#e2e8f0',
    accent: '#f472b6',
    accentSecondary: '#a78bfa',
    glow: 'rgba(244, 114, 182, 0.2)',
    avatar: '#f472b6',
    statBg: 'rgba(241, 245, 249, 0.7)',
    statBorder: '#e2e8f0',
    textPrimary: '#1e293b',
    textSecondary: '#94a3b8',
    iconColor: '#f472b6',
  },
  'high-contrast': {
    bg: '#0D0208',
    cardBg: 'rgba(10, 10, 10, 0.8)',
    border: '#1a1a1a',
    accent: '#39ff14',
    accentSecondary: '#33ff99',
    glow: 'rgba(57, 255, 20, 0.3)',
    avatar: '#39ff14',
    statBg: 'rgba(0, 0, 0, 0.5)',
    statBorder: '#1a1a1a',
    textPrimary: '#ffffff',
    textSecondary: '#9ca3af',
    iconColor: '#39ff14',
  },
};

/**
 * Theme display metadata
 */
export const THEME_METADATA: Record<ThemeName, { name: string; icon: string }> = {
  space: { name: 'Space', icon: '🚀' },
  sunset: { name: 'Sunset', icon: '🌅' },
  retro: { name: 'Retro', icon: '🌆' },
  minimal: { name: 'Light', icon: '⚪' },
  'high-contrast': { name: 'Dark', icon: '⚫' },
};

/**
 * Utility function to get all colors and layout for a theme
 */
export function getTheme(themeName: ThemeName) {
  return {
    name: themeName,
    colors: THEME_COLORS[themeName],
    metadata: THEME_METADATA[themeName],
    layout: LAYOUT,
  };
}
