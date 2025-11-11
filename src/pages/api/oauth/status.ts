import type { NextApiRequest, NextApiResponse } from 'next';

/**
 * Check if OAuth is configured
 * Returns whether GitHub OAuth client credentials are set up
 */
export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ configured: boolean }>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ configured: false });
  }

  const isConfigured = !!(
    process.env.GITHUB_OAUTH_CLIENT_ID &&
    process.env.GITHUB_OAUTH_CLIENT_SECRET
  );

  res.status(200).json({ configured: isConfigured });
}
