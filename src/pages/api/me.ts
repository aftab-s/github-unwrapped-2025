import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Extract token from httpOnly cookie
  const token = req.cookies.gh_token;

  if (!token) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    // Get user info from GitHub
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!userResponse.ok) {
      throw new Error('Failed to fetch user info');
    }

    const userData = await userResponse.json();

    return res.status(200).json({
      login: userData.login,
      name: userData.name,
      avatarUrl: userData.avatar_url,
      authenticated: true,
    });
  } catch (error) {
    console.error('Error fetching user info:', error);
    return res.status(500).json({ error: 'Failed to fetch user info' });
  }
}
