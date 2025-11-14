import { GetServerSideProps } from 'next';
import Head from 'next/head';
import React, { useState } from 'react';
import { fetchGitHubStats } from '@/lib/github';
import { ContributionGraph } from '@/components/ContributionGraph';
import { themeNames, ThemeName, userStatsSchema, type UserStats } from '@/types';
import { THEME_COLORS } from '@/types/theme';

interface DesktopPreviewProps {
  username: string;
  stats: UserStats | null;
  error?: string;
  themes: ThemeName[];
}

export const getServerSideProps: GetServerSideProps<DesktopPreviewProps> = async (ctx) => {
  const { query, req } = ctx;
  let username = typeof query.username === 'string' ? query.username : '';
  // Fallback to cookie 'lastUsername'
  if (!username && req.headers.cookie) {
    const match = req.headers.cookie.match(/lastUsername=([^;]+)/);
    if (match) username = decodeURIComponent(match[1]);
  }
  // If still empty, show error page
  if (!username) {
    return { props: { username: '', stats: null, error: 'No username provided.', themes: themeNames.slice() } };
  }

  // Parse themes query (?themes=space,retro)
  let themes: ThemeName[] = themeNames.slice();
  if (typeof query.themes === 'string' && query.themes.trim() !== '') {
    const requested = query.themes.split(',').map(t => t.trim()).filter(Boolean);
    const valid = requested.filter((t): t is ThemeName => (themeNames as readonly string[]).includes(t));
    if (valid.length) themes = valid;
  }

  try {
    const stats = await fetchGitHubStats(username);
    // Validate stats shape (defensive)
    const parsed = userStatsSchema.safeParse(stats);
    if (!parsed.success) {
      return { props: { username, stats: null, error: 'Stats validation failed', themes } };
    }
    return { props: { username, stats: parsed.data, themes } };
  } catch (err: any) {
    const msg = err?.message?.includes('rate limit') ? 'Rate limited. Retry later.' : err?.message || 'Failed to load stats';
    return { props: { username, stats: null, error: msg, themes } };
  }
};

// Helper for client-side PNG export of entire card
function useCardDownload() {
  const downloadCard = React.useCallback(async (theme: ThemeName, username: string) => {
    const card = document.querySelector(`[data-card-theme="${theme}"]`) as HTMLElement;
    if (!card) return;

    // Use html-to-image library if available, or show message
    try {
      // Dynamically import html-to-image
      const htmlToImage = await import('html-to-image');
      const dataUrl = await htmlToImage.toPng(card, {
        width: 1240,
        height: 1754,
        pixelRatio: 2,
      });
      const link = document.createElement('a');
      link.download = `${username}-${theme}-unwrapped-2025.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Download failed:', err);
      alert('Download feature requires html-to-image package. Please use browser screenshot instead.');
    }
  }, []);

  return downloadCard;
}

export default function DesktopPreviewPage({ username, stats, error, themes }: DesktopPreviewProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const downloadCard = useCardDownload();

  const currentTheme = themes[currentIndex];
  const colors = THEME_COLORS[currentTheme];

  const nextTheme = () => setCurrentIndex((prev) => (prev + 1) % themes.length);
  const prevTheme = () => setCurrentIndex((prev) => (prev - 1 + themes.length) % themes.length);

  // Keyboard navigation
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        nextTheme();
      } else if (e.key === 'ArrowLeft') {
        prevTheme();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [themes.length]);

  // Build small datasets for activity visuals
  const weeklyTotals = React.useMemo(() => {
    if (!stats?.contributionCalendar) return [] as number[];
    const weeks: number[] = [];
    const byWeek: Record<string, number> = {};
    stats.contributionCalendar.forEach((d) => {
      const date = new Date(d.date);
      const wk = `${date.getFullYear()}-${Math.floor((date.getTime() / 86400000 + 4 - date.getDay()) / 7)}`;
      byWeek[wk] = (byWeek[wk] || 0) + (d.count || 0);
    });
    Object.keys(byWeek).sort().forEach((k) => weeks.push(byWeek[k]));
    return weeks;
  }, [stats?.contributionCalendar]);

  const weekdayCounts = React.useMemo(() => {
    const counts = new Array(7).fill(0);
    if (!stats?.contributionCalendar) return counts;
    stats.contributionCalendar.forEach((d) => {
      const dow = new Date(d.date).getDay();
      counts[dow] += d.count || 0;
    });
    return counts;
  }, [stats?.contributionCalendar]);

  const weekdayNames = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const bestDayIndex = stats?.bestDayOfWeek ? weekdayNames.indexOf(stats.bestDayOfWeek) : -1;

  const pageTitle = username ? `Theme Gallery – @${username}` : 'Theme Gallery';

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="robots" content="noindex" />
        <meta name="viewport" content="width=1024, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </Head>
      
      <main 
        className="min-h-screen flex items-center justify-center overflow-hidden relative transition-colors duration-500"
        style={{
          background: currentTheme === 'minimal' ? '#f8fafc' : currentTheme === 'high-contrast' ? '#0D0208' : '#111827',
          minWidth: '1024px',
        }}
      >
        {/* Background patterns */}
        {currentTheme !== 'minimal' && currentTheme !== 'high-contrast' && (
          <div
            className="absolute inset-0 z-0 opacity-40"
            style={{
              backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'100%25\' height=\'100%25\'%3E%3Cdefs%3E%3CradialGradient id=\'grad\' cx=\'50%25\' cy=\'50%25\' r=\'50%25\'%3E%3Cstop offset=\'0%25\' stop-color=\'%231e1b4b\' /%3E%3Cstop offset=\'100%25\' stop-color=\'%230c0a1a\' /%3E%3C/radialGradient%3E%3C/defs%3E%3Crect width=\'100%25\' height=\'100%25\' fill=\'url(%23grad)\' /%3E%3C/svg%3E")',
            }}
          />
        )}
        
        {currentTheme === 'high-contrast' && (
          <div
            className="absolute inset-0 z-0"
            style={{
              backgroundImage: 'linear-gradient(rgba(128, 128, 128, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(128, 128, 128, 0.1) 1px, transparent 1px)',
              backgroundSize: '2rem 2rem',
            }}
          />
        )}
        
        {currentTheme !== 'high-contrast' && (
          <div
            className="absolute inset-0 z-0"
            style={{
              backgroundImage: currentTheme === 'minimal'
                ? 'radial-gradient(circle, rgba(226, 232, 240, 1) 1px, transparent 1px)'
                : 'radial-gradient(circle, rgba(255, 255, 255, 0.08) 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }}
          />
        )}

        {/* Navigation Controls - Fixed position */}
        <div className="fixed top-8 left-8 right-8 z-50 flex items-center justify-between">
          <a 
            href="/" 
            className="inline-flex items-center gap-2 text-sm transition-colors px-4 py-2 rounded-lg backdrop-blur-lg"
            style={{ 
              color: currentTheme === 'minimal' ? '#64748b' : '#9ca3af',
              backgroundColor: currentTheme === 'minimal' ? 'rgba(255,255,255,0.8)' : 'rgba(31,41,55,0.8)',
              border: `1px solid ${currentTheme === 'minimal' ? '#e2e8f0' : '#374151'}`,
            }}
          >
            <span className="material-symbols-outlined">arrow_back</span>
            Home
          </a>
          
          <div 
            className="flex items-center gap-4 px-6 py-3 rounded-full backdrop-blur-lg"
            style={{
              backgroundColor: currentTheme === 'minimal' ? 'rgba(255,255,255,0.9)' : 'rgba(31,41,55,0.9)',
              border: `1px solid ${colors.border}`,
            }}
          >
            <button
              onClick={prevTheme}
              className="p-2 rounded-full transition-all hover:scale-110 active:scale-95"
              style={{
                backgroundColor: colors.accent,
                color: '#ffffff',
              }}
              aria-label="Previous theme"
            >
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            
            <div className="text-center min-w-[120px]">
              <div 
                className="text-sm font-bold capitalize"
                style={{ color: colors.textPrimary }}
              >
                {currentTheme.replace('-', ' ')}
              </div>
              <div 
                className="text-xs"
                style={{ color: colors.textSecondary }}
              >
                {currentIndex + 1} of {themes.length}
              </div>
            </div>
            
            <button
              onClick={nextTheme}
              className="p-2 rounded-full transition-all hover:scale-110 active:scale-95"
              style={{
                backgroundColor: colors.accent,
                color: '#ffffff',
              }}
              aria-label="Next theme"
            >
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>

          <button
            onClick={() => downloadCard(currentTheme, username)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg backdrop-blur-lg font-semibold transition-all hover:scale-105 active:scale-95"
            style={{
              backgroundColor: colors.accent,
              color: '#ffffff',
              boxShadow: `0 4px 12px ${colors.accent}40`,
            }}
          >
            <span className="material-symbols-outlined">download</span>
            Download
          </button>
        </div>

        {/* Card Container - 1:1.414 aspect ratio (1240x1754px) */}
        {stats && (
          <div className="relative z-10 py-20 px-32" style={{ width: '100%' }}>
            <div 
              data-card-theme={currentTheme}
              className={`relative ${currentTheme === 'space' ? 'rounded-3xl' : ''} transition-all duration-500 mx-auto`}
              style={{
                aspectRatio: '1 / 1.414',
                height: '90vh',
                width: 'auto',
              }}
            >
              {/* Theme-specific decorative elements */}
              {currentTheme === 'retro' && (
                <div 
                  className="absolute inset-[-1px] rounded-3xl blur-lg -z-10"
                  style={{
                    background: 'linear-gradient(145deg, rgba(236, 72, 153, 0.8), rgba(6, 182, 212, 0.8))',
                  }}
                />
              )}
              
              {currentTheme === 'space' && (
                <div 
                  className="absolute inset-0 rounded-3xl pointer-events-none"
                  style={{
                    background: 'conic-gradient(from 180deg at 50% 50%, #6366f1, #14b8a6, #a855f7, #6366f1)',
                    padding: '2px',
                    borderRadius: '1.5rem',
                    zIndex: 0,
                  }}
                />
              )}
              
              <div 
                className={`relative backdrop-blur-lg rounded-3xl p-4 border overflow-hidden ${currentTheme === 'space' ? 'z-10' : ''} h-full flex flex-col`}
                style={{
                  backgroundColor: currentTheme === 'space' ? 'rgba(31, 41, 55, 0.9)' : colors.cardBg,
                  borderColor: currentTheme === 'space' ? 'rgba(255, 255, 255, 0.1)' : colors.border,
                  boxShadow: currentTheme === 'minimal' ? '0 25px 50px -12px rgba(0, 0, 0, 0.15)' : 'none',
                }}
              >
                {/* Space theme nebula background */}
                {currentTheme === 'space' && (
                  <div 
                    className="absolute inset-0 z-0 opacity-30 rounded-[22px] pointer-events-none"
                    style={{
                      backgroundImage: 'radial-gradient(ellipse 100% 70% at 20% 0%, #6366f1, transparent), radial-gradient(ellipse 100% 70% at 80% 100%, #14b8a6, transparent)',
                    }}
                  />
                )}

                {/* Retro scanlines */}
                {currentTheme === 'retro' && (
                  <div className="absolute inset-0 z-0 pointer-events-none rounded-[22px] overflow-hidden">
                    {Array.from({ length: 200 }).map((_, i) => (
                      <div
                        key={i}
                        className="absolute w-full"
                        style={{
                          height: '2px',
                          top: `${i * 0.5}%`,
                          background: 'rgba(255, 255, 255, 0.03)',
                        }}
                      />
                    ))}
                  </div>
                )}

                {/* High contrast grid */}
                {currentTheme === 'high-contrast' && (
                  <div className="absolute inset-0 z-0 pointer-events-none rounded-[22px] overflow-hidden opacity-10">
                    <div style={{
                      backgroundImage: 'linear-gradient(rgba(20, 184, 166, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(20, 184, 166, 0.3) 1px, transparent 1px)',
                      backgroundSize: '20px 20px',
                      width: '100%',
                      height: '100%',
                    }} />
                  </div>
                )}

                <div className="relative z-10 h-full flex flex-col">
                  {/* Header Section */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <img 
                        alt={`${stats.login} avatar`}
                        className="w-14 h-14 rounded-full border-2 shadow-lg flex-shrink-0"
                        style={{
                          borderColor: colors.avatar,
                          boxShadow: currentTheme === 'retro' 
                            ? `0 0 20px ${colors.avatar}` 
                            : `0 10px 15px -3px ${colors.glow}`,
                        }}
                        src={stats.avatarUrl}
                      />
                      <div>
                        <h2 
                          className="text-lg font-bold"
                          style={{ 
                            color: colors.textPrimary,
                            textShadow: currentTheme === 'retro' ? `0 0 5px ${colors.accent}` : 'none'
                          }}
                        >
                          @{stats.login}
                        </h2>
                        <p className="text-xs" style={{ color: colors.textSecondary }}>
                          {stats.name || 'Display Name'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs" style={{ color: colors.textSecondary }}>
                        Your Open Source Story
                      </p>
                      <p 
                        className="text-2xl font-bold"
                        style={{
                          backgroundImage: `linear-gradient(to right, ${colors.accent}, ${colors.accentSecondary})`,
                          backgroundClip: 'text',
                          WebkitBackgroundClip: 'text',
                          color: 'transparent',
                          WebkitTextFillColor: 'transparent',
                        }}
                      >
                        2025
                      </p>
                    </div>
                  </div>

                  {/* Stats Grid - 3 columns, 2 rows */}
                  <div className="grid grid-cols-3 gap-2 mb-2">
                    <div 
                      className="border p-2 rounded-lg text-center"
                      style={{
                        backgroundColor: colors.statBg,
                        borderColor: colors.statBorder,
                      }}
                    >
                      <p 
                        className="text-[10px] uppercase tracking-wider mb-0.5"
                        style={{ color: colors.textSecondary }}
                      >
                        Contributions
                      </p>
                      <p 
                        className="text-xl font-bold"
                        style={{ 
                          backgroundImage: `linear-gradient(to right, ${colors.accent}, ${colors.accentSecondary})`,
                          backgroundClip: 'text',
                          WebkitBackgroundClip: 'text',
                          color: 'transparent',
                          WebkitTextFillColor: 'transparent',
                        }}
                      >
                        {stats.totalCommits}
                      </p>
                    </div>
                    
                    {[
                      { label: 'Longest Streak', value: stats.longestStreakDays },
                      { label: 'Pull Requests', value: stats.totalPRs },
                      { label: 'Issues', value: stats.totalIssues },
                      { label: 'Stars', value: stats.totalStarsGiven },
                      { label: 'Total Repositories', value: stats.totalRepositories },
                    ].map((stat, index) => (
                      <div 
                        key={index}
                        className="border p-2 rounded-lg text-center"
                        style={{
                          backgroundColor: colors.statBg,
                          borderColor: colors.statBorder,
                        }}
                      >
                        <p 
                          className="text-[10px] uppercase tracking-wider mb-0.5"
                          style={{ color: colors.textSecondary }}
                        >
                          {stat.label}
                        </p>
                        <p 
                          className="text-xl font-bold"
                          style={{ color: colors.textPrimary }}
                        >
                          {stat.value}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Activity Insights */}
                  {stats.bestDayOfWeek && (
                    <div 
                      className="border p-2 rounded-lg overflow-hidden relative mb-2"
                      style={{
                        backgroundColor: colors.statBg,
                        borderColor: colors.statBorder,
                      }}
                    >
                      <h3 
                        className="text-[10px] font-bold mb-1.5 flex items-center gap-1"
                        style={{ color: colors.textPrimary }}
                      >
                        <span 
                          className="material-symbols-outlined text-xs"
                          style={{ color: colors.accent }}
                        >
                          insights
                        </span>
                        Activity Insights
                      </h3>

                      <div className="grid grid-cols-3 gap-1.5">
                        {/* Peak Day */}
                        <div 
                          className="p-1.5 rounded-lg relative overflow-hidden"
                          style={{
                            background: currentTheme === 'minimal' 
                              ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.05))'
                              : `linear-gradient(135deg, ${colors.accent}20, ${colors.accentSecondary}10)`,
                            border: `1px solid ${colors.accent}40`,
                          }}
                        >
                          <div className="flex items-center gap-0.5 mb-0.5">
                            <span className="text-xs">📅</span>
                            <p 
                              className="text-[8px] uppercase tracking-wide font-bold"
                              style={{ color: colors.accent }}
                            >
                              Peak Day
                            </p>
                          </div>
                          <p 
                            className="text-xs font-bold"
                            style={{ color: colors.textPrimary }}
                          >
                            {stats.bestDayOfWeek}
                          </p>
                        </div>

                        {/* Peak Hour */}
                        <div 
                          className="p-1.5 rounded-lg relative overflow-hidden"
                          style={{
                            background: currentTheme === 'minimal'
                              ? 'linear-gradient(135deg, rgba(236, 72, 153, 0.1), rgba(251, 113, 133, 0.05))'
                              : `linear-gradient(135deg, ${colors.accentSecondary}20, ${colors.accent}10)`,
                            border: `1px solid ${colors.accentSecondary}40`,
                          }}
                        >
                          <div className="flex items-center gap-0.5 mb-0.5">
                            <span className="text-xs">⏰</span>
                            <p 
                              className="text-[8px] uppercase tracking-wide font-bold"
                              style={{ color: colors.accentSecondary }}
                            >
                              Peak Hour
                            </p>
                          </div>
                          <p 
                            className="text-xs font-bold"
                            style={{ color: colors.textPrimary }}
                          >
                            {stats.bestHour === 0 ? '12 AM' : 
                             stats.bestHour === 12 ? '12 PM' : 
                             stats.bestHour < 12 ? `${stats.bestHour} AM` : 
                             `${stats.bestHour - 12} PM`}
                          </p>
                        </div>

                        {/* Weekly Pattern */}
                        {weekdayCounts.some((c) => c > 0) && (
                          <div 
                            className="p-1.5 rounded-lg"
                            style={{
                              backgroundColor: currentTheme === 'minimal' 
                                ? 'rgba(241, 245, 249, 0.6)' 
                                : currentTheme === 'high-contrast'
                                ? 'rgba(0, 0, 0, 0.3)'
                                : `${colors.cardBg}50`,
                              border: `1px solid ${colors.statBorder}`,
                            }}
                          >
                            <div className="flex items-center gap-0.5 mb-1">
                              <span className="text-[10px]">🔥</span>
                              <p 
                                className="text-[8px] font-bold uppercase tracking-wide"
                                style={{ color: colors.textPrimary }}
                              >
                                Weekly Pattern
                              </p>
                            </div>
                            
                            <div className="grid grid-cols-7 gap-0.5">
                              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, idx) => {
                                const count = weekdayCounts[idx];
                                const maxCount = Math.max(...weekdayCounts);
                                const heightPercent = maxCount > 0 ? (count / maxCount) * 100 : 0;
                                const isBestDay = idx === bestDayIndex;
                                
                                return (
                                  <div key={idx} className="flex flex-col items-center gap-0.5">
                                    <div 
                                      className="w-full relative flex items-end justify-center"
                                      style={{ height: '20px' }}
                                    >
                                      <div 
                                        className="w-full rounded-sm"
                                        style={{
                                          height: `${Math.max(15, heightPercent)}%`,
                                          background: isBestDay
                                            ? `linear-gradient(to top, ${colors.accent}, ${colors.accentSecondary})`
                                            : currentTheme === 'minimal'
                                            ? `linear-gradient(to top, ${colors.accent}50, ${colors.accent}30)`
                                            : currentTheme === 'high-contrast'
                                            ? `linear-gradient(to top, ${colors.accent}90, ${colors.accent}60)`
                                            : `linear-gradient(to top, ${colors.accent}70, ${colors.accent}40)`,
                                          boxShadow: isBestDay 
                                            ? `0 1px 4px ${colors.accent}60` 
                                            : `0 0.5px 2px ${colors.accent}20`,
                                        }}
                                      />
                                    </div>
                                    <span 
                                      className="text-[7px] font-semibold"
                                      style={{ 
                                        color: isBestDay ? colors.accent : colors.textSecondary,
                                      }}
                                    >
                                      {day}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Top Languages & Anniversary - 2 columns */}
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    {/* Top Languages */}
                    {stats.topLanguages.length > 0 && (
                      <div 
                        className="border p-2 rounded-lg"
                        style={{
                          backgroundColor: colors.statBg,
                          borderColor: colors.statBorder,
                        }}
                      >
                        <h3 
                          className="text-xs font-bold mb-2 flex items-center gap-1"
                          style={{ color: colors.textPrimary }}
                        >
                          <span className="material-symbols-outlined text-sm" style={{ color: colors.iconColor }}>
                            code
                          </span>
                          Top Languages
                        </h3>
                        <div className="space-y-1.5">
                          {stats.topLanguages.slice(0, 3).map((lang, index) => {
                            const fallbackGradient = index === 0
                              ? `linear-gradient(to right, ${colors.accent}, ${currentTheme === 'minimal' ? '#f9a8d4' : currentTheme === 'retro' ? '#f9a8d4' : currentTheme === 'sunset' ? '#ec4899' : colors.accentSecondary})`
                              : index === 1
                              ? (currentTheme === 'retro' ? 'linear-gradient(to right, #06b6d4, #38bdf8)' : 'linear-gradient(to right, #6366f1, #a78bfa)')
                              : 'linear-gradient(to right, #f59e0b, #fbbf24)';

                            return (
                              <div key={lang.name}>
                                <div className="flex items-center justify-between mb-0.5">
                                  <div className="flex items-center gap-1.5">
                                    <span
                                      className="inline-block rounded-full"
                                      style={{ width: 6, height: 6, backgroundColor: lang.color || colors.iconColor }}
                                    />
                                    <span 
                                      className="text-[10px] font-medium"
                                      style={{ color: colors.textPrimary }}
                                    >
                                      {lang.name}
                                    </span>
                                  </div>
                                  <span 
                                    className="text-[10px] font-bold"
                                    style={{ color: colors.textPrimary }}
                                  >
                                    {(lang.percent * 100).toFixed(1)}%
                                  </span>
                                </div>
                                <div 
                                  className="relative h-1.5 rounded-full overflow-hidden"
                                  style={{ 
                                    backgroundColor: currentTheme === 'minimal' 
                                      ? 'rgba(226, 232, 240, 1)' 
                                      : currentTheme === 'retro'
                                      ? 'rgba(131, 24, 67, 0.5)'
                                      : currentTheme === 'sunset'
                                      ? 'rgba(63, 63, 70, 0.5)'
                                      : currentTheme === 'high-contrast'
                                      ? 'rgba(0, 0, 0, 0.4)'
                                      : 'rgba(55, 65, 81, 0.5)'
                                  }}
                                >
                                  <div 
                                    className="absolute top-0 left-0 h-full rounded-full"
                                    style={{ 
                                      width: `${Math.max(2, Math.round(lang.percent * 100))}%`,
                                      background: lang.color || fallbackGradient,
                                    }}
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Anniversary */}
                    <div 
                      className="border p-2 rounded-lg"
                      style={{
                        backgroundColor: colors.statBg,
                        borderColor: colors.statBorder,
                      }}
                    >
                      <h3 
                        className="text-xs font-bold mb-2 flex items-center gap-1"
                        style={{ color: colors.textPrimary }}
                      >
                        <span className="material-symbols-outlined text-sm" style={{ color: colors.iconColor }}>
                          celebration
                        </span>
                        Anniversary
                      </h3>
                      <div className="flex flex-col items-center justify-center" style={{ height: '80px' }}>
                        <div 
                          className="w-14 h-14 rounded-full flex items-center justify-center font-bold text-white shadow-lg text-xl mb-1.5"
                          style={{
                            background: `linear-gradient(to bottom right, ${colors.accent}, ${colors.accentSecondary})`,
                          }}
                        >
                          {stats.githubAnniversary}
                        </div>
                        <p className="text-base font-bold" style={{ color: colors.textPrimary }}>
                          {stats.githubAnniversary} {stats.githubAnniversary === 1 ? 'Year' : 'Years'}
                        </p>
                        <p className="text-[10px]" style={{ color: colors.textSecondary }}>
                          on GitHub
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Section - 2 columns */}
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    {/* Top Repository */}
                    {stats.topRepos.length > 0 && (
                      <div 
                        className="border p-2 rounded-lg"
                        style={{
                          backgroundColor: colors.statBg,
                          borderColor: colors.statBorder,
                        }}
                      >
                        <h3 
                          className="text-xs font-bold mb-2 flex items-center gap-1"
                          style={{ color: colors.textPrimary }}
                        >
                          <span className="material-symbols-outlined text-sm" style={{ color: colors.iconColor }}>
                            star
                          </span>
                          Top Repository
                        </h3>
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shadow-lg text-sm flex-shrink-0"
                            style={{
                              background: `linear-gradient(to bottom right, ${colors.accent}, ${colors.accentSecondary})`,
                            }}
                          >
                            {stats.topRepos[0].name.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-xs truncate" style={{ color: colors.textPrimary }}>
                              {stats.topRepos[0].name}
                            </p>
                            <p className="text-[10px]" style={{ color: colors.textSecondary }}>
                              {stats.topRepos[0].contributions} contributions
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Year-over-Year Growth */}
                    {stats.yearOverYearGrowth && (
                      <div 
                        className="border p-2 rounded-lg"
                        style={{
                          backgroundColor: colors.statBg,
                          borderColor: colors.statBorder,
                        }}
                      >
                        <h3 
                          className="text-xs font-bold mb-1 flex items-center gap-1"
                          style={{ color: colors.textPrimary }}
                        >
                          <span 
                            className="material-symbols-outlined text-sm"
                            style={{ color: colors.accent }}
                          >
                            trending_up
                          </span>
                          Overall Growth
                        </h3>
                        <div className="text-center">
                          <p className="text-[9px] mb-0.5" style={{ color: colors.textSecondary }}>
                            (Year over year)
                          </p>
                          <p 
                            className="text-3xl font-bold"
                            style={{ color: stats.yearOverYearGrowth.overallGrowth >= 0 ? colors.accent : '#ef4444' }}
                          >
                            {stats.yearOverYearGrowth.overallGrowth > 0 ? '+' : ''}
                            {stats.yearOverYearGrowth.overallGrowth}%
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Contribution Graph - Full width */}
                  {stats.contributionCalendar && stats.contributionCalendar.length > 0 && (
                    <ContributionGraph 
                      data={stats.contributionCalendar}
                      theme={currentTheme}
                      themeColors={colors}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {!stats && (
          <div className="relative z-10 text-center">
            <p className="text-xl mb-4" style={{ color: colors.textSecondary }}>
              {error || 'No data available'}
            </p>
            <a 
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all"
              style={{
                backgroundColor: colors.accent,
                color: '#ffffff',
              }}
            >
              <span className="material-symbols-outlined">arrow_back</span>
              Go Home
            </a>
          </div>
        )}

        {/* Keyboard navigation hint */}
        <div 
          className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50 px-4 py-2 rounded-full backdrop-blur-lg text-xs"
          style={{
            backgroundColor: currentTheme === 'minimal' ? 'rgba(255,255,255,0.8)' : 'rgba(31,41,55,0.8)',
            color: colors.textSecondary,
            border: `1px solid ${colors.border}`,
          }}
        >
          Use ← → arrow keys to navigate
        </div>
      </main>
    </>
  );
}
