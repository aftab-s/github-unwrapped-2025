import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const clientId = process.env.GITHUB_OAUTH_CLIENT_ID;
  const redirectUri = `${process.env.NEXT_PUBLIC_SITE_URL}/api/oauth/callback`;

  if (!clientId) {
    return res.status(500).json({ error: 'OAuth not configured' });
  }

  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=read:user,repo`;

  res.redirect(githubAuthUrl);
}
