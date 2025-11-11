import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { code } = req.query;

  if (!code || typeof code !== 'string') {
    return res.status(400).json({ error: 'Authorization code is required' });
  }

  const clientId = process.env.GITHUB_OAUTH_CLIENT_ID;
  const clientSecret = process.env.GITHUB_OAUTH_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return res.status(500).json({ error: 'OAuth not configured' });
  }

  try {
    // Exchange code for access token
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      throw new Error(tokenData.error_description || 'OAuth error');
    }

    const accessToken = tokenData.access_token;

    // Get user info
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const userData = await userResponse.json();

    // In production, you should:
    // 1. Store the token securely (encrypted in httpOnly cookie or session)
    // 2. Create a session for the user
    // For this MVP, we'll redirect with user info and let client handle it

    // Set httpOnly cookie with token (basic security - enhance for production)
    res.setHeader(
      'Set-Cookie',
      `gh_token=${accessToken}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=3600`
    );

    // Redirect to homepage with success
    res.redirect(`/?login=${userData.login}&oauth=success`);
  } catch (error: any) {
    console.error('OAuth callback error:', error);
    res.redirect(`/?oauth=error&message=${encodeURIComponent(error.message)}`);
  }
}
