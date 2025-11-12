import React from 'react';
import type { ThemeName } from '@/types';
import { themeNames } from '@/types';

interface ThemeSelectorProps {
  currentTheme: ThemeName;
  onThemeChange: (theme: ThemeName) => void;
}

const themeDisplayNames: Record<ThemeName, string> = {
  space: '🚀 Space',
  sunset: '🌅 Sunset',
  retro: '🌆 Retro',
  minimal: '⚪ Light',
  'high-contrast': '⚫ Dark',
};

const themeColors: Record<ThemeName, { bg: string; accent: string }> = {
  space: { bg: '#0a0e27', accent: '#00ffcc' },
  sunset: { bg: '#ff6b35', accent: '#fff75e' },
  retro: { bg: '#2d1b69', accent: '#ffbe0b' },
  minimal: { bg: '#f8f9fa', accent: '#495057' },
  'high-contrast': { bg: '#000000', accent: '#00ff41' },
};

export function ThemeSelector({ currentTheme, onThemeChange }: ThemeSelectorProps) {
  return (
    <div className="space-y-4 bg-gray-800/30 p-6 rounded-lg border border-gray-700/50">
      <h3 className="text-xl font-bold flex items-center gap-2 text-white">
        <span>🎨</span>
        <span>Choose Theme</span>
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {themeNames.map((theme) => {
          const isActive = currentTheme === theme;
          const colors = themeColors[theme];
          
          return (
            <button
              key={theme}
              onClick={() => onThemeChange(theme)}
              className={`
                relative p-3 rounded-xl border-2 transition-all duration-200 min-h-[70px] flex flex-col items-center justify-center gap-1
                ${isActive 
                  ? 'border-primary scale-105 shadow-2xl ring-2 ring-primary/50' 
                  : 'border-gray-700 hover:border-gray-600 opacity-80 hover:opacity-100 hover:scale-102'
                }
              `}
              style={{
                background: isActive
                  ? `linear-gradient(135deg, ${colors.bg} 0%, ${colors.accent}22 100%)`
                  : `${colors.bg}99`,
              }}
              aria-label={`Select ${themeDisplayNames[theme]} theme`}
              aria-pressed={isActive}
            >
              {/* Theme color preview dot */}
              <div 
                className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full border border-white/50"
                style={{ backgroundColor: colors.accent }}
              />
              
              {/* Icon and Name Container */}
              <div className="flex flex-col items-center gap-0.5">
                {/* Icon (Line 1) */}
                <div className="text-base">
                  {themeDisplayNames[theme].split(' ')[0]}
                </div>
                
                {/* Theme Name (Line 2) - Small */}
                <div className={`text-xs font-medium leading-tight ${
                  theme === 'minimal' ? 'text-gray-900' : 'text-white'
                }`}>
                  {themeDisplayNames[theme].split(' ')[1]}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
