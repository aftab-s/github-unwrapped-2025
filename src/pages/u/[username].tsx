import Head from 'next/head';
import { useRouter } from 'next/router';
import React, { useState, useRef, useEffect } from 'react';
import { CardRenderer } from '@/components/CardRenderer';
import { ThemeSelector } from '@/components/ThemeSelector';
import { DownloadButton } from '@/components/DownloadButton';
import { ShareButton } from '@/components/ShareButton';
import type { UserStats, ThemeName, StatsAPIResponse } from '@/types';

export default function UserPage() {
  const router = useRouter();
  const { username } = router.query;
  const themeParam = router.query.theme as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [theme, setTheme] = useState<ThemeName>('space');

  const cardRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!username || typeof username !== 'string') return;

    // Set theme from URL parameter
    if (themeParam && ['space', 'sunset', 'retro', 'minimal', 'high-contrast'].includes(themeParam)) {
      setTheme(themeParam as ThemeName);
    }

    // Fetch stats
    const fetchStats = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/stats?username=${encodeURIComponent(username)}`);
        const data: StatsAPIResponse = await response.json();

        if (!data.success) {
          setError(data.error);
          return;
        }

        setStats(data.data);
      } catch (err) {
        console.error('Fetch error:', err);
        setError('Failed to load card. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [username, themeParam]);

  // Update theme in URL when changed
  const handleThemeChange = (newTheme: ThemeName) => {
    setTheme(newTheme);
    router.push(`/u/${username}?theme=${newTheme}`, undefined, { shallow: true });
  };

  // Update document theme attribute
  useEffect(() => {
    if (typeof window !== 'undefined') {
      document.documentElement.setAttribute('data-theme', theme);
    }
  }, [theme]);

  if (loading) {
    return (
      <>
        <Head>
          <title>GitHub Unwrapped 2025</title>
        </Head>
        <main className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="spinner mx-auto mb-4" />
            <p className="text-xl">Loading GitHub Unwrapped...</p>
          </div>
        </main>
      </>
    );
  }

  if (error || !stats) {
    return (
      <>
        <Head>
          <title>GitHub Unwrapped 2025</title>
        </Head>
        <main className="min-h-screen flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <h1 className="text-4xl font-bold mb-4">Oops!</h1>
            <p className="text-xl mb-6">{error || 'Failed to load card'}</p>
            <a href="/" className="btn inline-block">
              Generate Your Own
            </a>
          </div>
        </main>
      </>
    );
  }

  const pageTitle = `@${stats.login}'s GitHub Unwrapped 2025`;
  const pageDescription = `${stats.totalCommits} commits, ${stats.longestStreakDays} day streak, ${stats.totalPRs} PRs in 2025!`;

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
      </Head>

      <main className="min-h-screen py-8 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <a href="/" className="inline-block mb-4 opacity-75 hover:opacity-100 transition-opacity">
              ← Create Your Own
            </a>
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-2">
              @{stats.login}'s GitHub Unwrapped
            </h1>
            <h2 className="text-2xl md:text-3xl font-display font-semibold" style={{ color: 'var(--theme-accent)' }}>
              2025
            </h2>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Card Preview */}
            <div>
              <div className="card-preview-container">
                <div className="card-preview">
                  <CardRenderer ref={cardRef} stats={stats} theme={theme} />
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="space-y-6">
              <ThemeSelector currentTheme={theme} onThemeChange={handleThemeChange} />

              <div className="space-y-4">
                <DownloadButton svgRef={cardRef} username={stats.login} />
                <ShareButton username={stats.login} theme={theme} />
              </div>

              <a href="/" className="block w-full px-6 py-3 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors text-center">
                Generate Your Own Card
              </a>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
