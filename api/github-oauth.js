/**
 * Exchanges a GitHub OAuth `code` for an access token.
 *
 * This exists only because the client secret cannot be shipped to the browser.
 * Set GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET in the Vercel project settings.
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    return res.status(500).json({ error: 'OAuth is not configured on the server.' });
  }

  const code = req.body && req.body.code;
  if (!code) return res.status(400).json({ error: 'Missing code.' });

  try {
    const ghRes = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ client_id: clientId, client_secret: clientSecret, code }),
    });
    const data = await ghRes.json();

    if (data.error || !data.access_token) {
      return res.status(400).json({ error: data.error_description || 'Token exchange failed.' });
    }
    // Only the token travels back — never the secret.
    return res.status(200).json({ access_token: data.access_token });
  } catch {
    return res.status(502).json({ error: 'Could not reach GitHub.' });
  }
}
