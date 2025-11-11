import Head from 'next/head';
import React, { useState, useRef, useEffect } from 'react';
import { CardRenderer } from '@/components/CardRenderer';
import { ThemeSelector } from '@/components/ThemeSelector';
import { DownloadButton } from '@/components/DownloadButton';
import { ShareButton } from '@/components/ShareButton';
import type { UserStats, ThemeName, StatsAPIResponse } from '@/types';

export default function Home() {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [theme, setTheme] = useState<ThemeName>('space');
  const [authUser, setAuthUser] = useState<string | null>(null);
  const [oauthConfigured, setOauthConfigured] = useState(false);
  
  const cardRef = useRef<SVGSVGElement>(null);

  // Check OAuth configuration on mount
  useEffect(() => {
    fetch('/api/oauth/status')
      .then(res => res.json())
      .then(data => setOauthConfigured(data.configured))
      .catch(() => setOauthConfigured(false));
  }, []);

  // Check for OAuth success/user in URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const oauthLogin = params.get('login');
    const oauthStatus = params.get('oauth');

    if (oauthStatus === 'success' && oauthLogin) {
      setAuthUser(oauthLogin);
      setUsername(oauthLogin);
      // Clean URL
      window.history.replaceState({}, '', '/');
    } else if (oauthStatus === 'error') {
      const message = params.get('message') || 'Authentication failed';
      setError(message);
      window.history.replaceState({}, '', '/');
    }

    // Try to get saved theme from localStorage
    const savedTheme = localStorage.getItem('gh-unwrapped-theme') as ThemeName;
    if (savedTheme && ['space', 'sunset', 'retro', 'minimal', 'high-contrast'].includes(savedTheme)) {
      setTheme(savedTheme);
    }
  }, []);

  // Save theme to localStorage when changed
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('gh-unwrapped-theme', theme);
      document.documentElement.setAttribute('data-theme', theme);
    }
  }, [theme]);

  const handleFetchStats = async () => {
    if (!username.trim()) {
      setError('Please enter a GitHub username');
      return;
    }

    setLoading(true);
    setError(null);
    setStats(null);

    try {
      const response = await fetch(`/api/stats?username=${encodeURIComponent(username.trim())}`);
      const data: StatsAPIResponse = await response.json();

      if (!data.success) {
        setError(data.error);
        return;
      }

      setStats(data.data);

      if (data.stale) {
        setError('⚠️ Using cached data due to rate limits');
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Failed to fetch stats. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleFetchStats();
    }
  };

  return (
    <>
      <Head>
        <title>GitHub Unwrapped 2025 - Your Year in Code</title>
        <meta name="description" content="Create and share your GitHub year-in-review card for 2025" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="min-h-screen py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8 sm:mb-12">
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-display font-bold mb-3 sm:mb-4">
              GitHub Unwrapped
            </h1>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-semibold mb-4 sm:mb-6" style={{ color: 'var(--theme-accent)' }}>
              2025
            </h2>
            <p className="text-lg sm:text-xl md:text-2xl opacity-90 mb-6 sm:mb-8">
              Your year in code, visualized
            </p>

            {/* OAuth Sign In */}
            {oauthConfigured && !authUser && (
              <div className="mb-6">
                <a
                  href="/api/oauth/url"
                  className="inline-block px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  🔒 Sign in with GitHub (optional - for private repos)
                </a>
              </div>
            )}

            {authUser && (
              <div className="mb-6 text-green-400">
                ✓ Signed in as @{authUser}
              </div>
            )}
          </div>

          {/* Input Section */}
          {!stats && (
            <div className="max-w-2xl mx-auto mb-12 px-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter GitHub username..."
                  className="flex-1 px-6 py-4 rounded-lg text-lg bg-white/10 backdrop-blur-sm border-2 border-white/20 focus:border-white/40 outline-none transition-colors placeholder-white/50"
                  disabled={loading}
                />
                <button
                  onClick={handleFetchStats}
                  disabled={loading || !username.trim()}
                  className="btn px-8 py-4 whitespace-nowrap"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="spinner" style={{ width: '20px', height: '20px', borderWidth: '2px' }} />
                      <span>Loading...</span>
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <span>✨</span>
                      <span>Generate</span>
                    </span>
                  )}
                </button>
              </div>

              {error && (
                <div className="mt-4 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-center backdrop-blur-sm">
                  <p className="font-medium">{error}</p>
                </div>
              )}

              {/* Info */}
              <div className="mt-8 text-center opacity-75 space-y-2">
                <p>✨ No signup required - just enter any public GitHub username</p>
                {oauthConfigured && (
                  <p>🔒 Sign in with GitHub to include private contributions</p>
                )}
                <p>📅 Shows your 2025 activity only</p>
              </div>
            </div>
          )}

          {/* Results Section */}
          {stats && (
            <div className="grid lg:grid-cols-[1.2fr,0.8fr] gap-8 items-start">
              {/* Card Preview */}
              <div className="order-2 lg:order-1">
                <h3 className="text-2xl font-semibold mb-4 text-center lg:text-left">Your Card</h3>
                <div className="card-preview-container bg-black/20 backdrop-blur-sm rounded-xl">
                  <div className="card-preview w-full">
                    <CardRenderer ref={cardRef} stats={stats} theme={theme} />
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div className="space-y-6 order-1 lg:order-2 lg:sticky lg:top-8">
                <ThemeSelector currentTheme={theme} onThemeChange={setTheme} />

                <div className="space-y-3">
                  <DownloadButton svgRef={cardRef} username={stats.login} />
                  <ShareButton username={stats.login} theme={theme} />
                </div>

                <button
                  onClick={() => {
                    setStats(null);
                    setUsername('');
                    setError(null);
                  }}
                  className="w-full px-6 py-3 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors text-white font-medium"
                >
                  ← Generate Another Card
                </button>

                {/* Stats Summary */}
                <div className="p-6 bg-white/5 backdrop-blur-sm rounded-lg space-y-3 text-sm border border-white/10">
                  <h4 className="font-semibold text-lg mb-3 flex items-center gap-2">
                    <span>📊</span> Quick Stats
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Total Commits</span>
                      <strong className="text-lg" style={{ color: 'var(--theme-accent)' }}>{stats.totalCommits.toLocaleString()}</strong>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Longest Streak</span>
                      <strong className="text-lg" style={{ color: 'var(--theme-accent)' }}>{stats.longestStreakDays} days</strong>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Pull Requests</span>
                      <strong className="text-lg" style={{ color: 'var(--theme-accent)' }}>{stats.totalPRs.toLocaleString()}</strong>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Issues</span>
                      <strong className="text-lg" style={{ color: 'var(--theme-accent)' }}>{stats.totalIssues.toLocaleString()}</strong>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">PR Reviews</span>
                      <strong className="text-lg" style={{ color: 'var(--theme-accent)' }}>{stats.totalPRReviews.toLocaleString()}</strong>
                    </div>
                    {stats.topLanguages.length > 0 && (
                      <div className="pt-2 mt-2 border-t border-white/10">
                        <div className="text-gray-300 mb-2">Top Languages:</div>
                        {stats.topLanguages.slice(0, 3).map((lang, i) => (
                          <div key={i} className="flex justify-between items-center text-sm mb-1">
                            <span className="flex items-center gap-2">
                              {lang.color && (
                                <span 
                                  className="w-3 h-3 rounded-full" 
                                  style={{ backgroundColor: lang.color }}
                                />
                              )}
                              {lang.name}
                            </span>
                            <span className="text-gray-400">{(lang.percent * 100).toFixed(1)}%</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Footer */}
          <footer className="mt-16 text-center opacity-60 text-sm space-y-2">
            <p>Built with Next.js, React, and ❤️</p>
            <p>
              <a href="/privacy" className="hover:underline">Privacy Policy</a>
              {' · '}
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:underline">
                GitHub
              </a>
            </p>
          </footer>
        </div>
      </main>
    </>
  );
}
