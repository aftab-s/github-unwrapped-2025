import { NextApiRequest, NextApiResponse } from 'next';
import { fetchGitHubStats } from '@/lib/github';
import { themeNames, ThemeName, userStatsSchema } from '@/types';

/**
 * This endpoint serves as a bridge to download the preview card as PNG.
 * It's called from the dashboard page when user clicks download.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { username, theme } = req.query;

  if (!username || typeof username !== 'string') {
    return res.status(400).json({ error: 'Username is required' });
  }

  if (!theme || typeof theme !== 'string' || !themeNames.includes(theme as ThemeName)) {
    return res.status(400).json({ error: 'Invalid theme' });
  }

  try {
    // Fetch stats to validate user
    const stats = await fetchGitHubStats(username);
    const parsed = userStatsSchema.safeParse(stats);

    if (!parsed.success) {
      return res.status(400).json({ error: 'Failed to validate stats' });
    }

    // Redirect to the preview page which will handle the download
    // The preview page uses html-to-image on the client side
    const previewUrl = `/preview/desktop?username=${encodeURIComponent(username)}&theme=${encodeURIComponent(theme)}&download=true`;
    res.redirect(302, previewUrl);
  } catch (error: any) {
    console.error('Preview download error:', error);
    res.status(500).json({ error: 'Failed to process download' });
  }
}
