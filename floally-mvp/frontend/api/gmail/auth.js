/**
 * Vercel Serverless Function - Google OAuth Initiation
 * 
 * Starts the Google OAuth flow for Gmail + Calendar access
 * User will be redirected to Google's consent screen
 */

export default async function handler(req, res) {
  // Get user ID from request (from session/token)
  const { userId } = req.query;
  
  if (!userId) {
    return res.status(400).json({ error: 'Missing userId parameter' });
  }
  
  // Google OAuth configuration
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = `${process.env.VERCEL_URL || 'https://okaimy.com'}/api/gmail/callback`;
  
  if (!clientId) {
    return res.status(500).json({ 
      error: 'Google OAuth not configured',
      hint: 'Set GOOGLE_CLIENT_ID environment variable'
    });
  }
  
  // OAuth scopes for Gmail + Calendar
  const scopes = [
    // Gmail permissions
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://www.googleapis.com/auth/gmail.modify',
    // Calendar permissions
    'https://www.googleapis.com/auth/calendar.readonly',
    'https://www.googleapis.com/auth/calendar.events',
    // User info
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile'
  ];
  
  // Build authorization URL
  const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  authUrl.searchParams.append('client_id', clientId);
  authUrl.searchParams.append('redirect_uri', redirectUri);
  authUrl.searchParams.append('response_type', 'code');
  authUrl.searchParams.append('scope', scopes.join(' '));
  authUrl.searchParams.append('access_type', 'offline');
  authUrl.searchParams.append('prompt', 'consent');
  authUrl.searchParams.append('state', userId); // Pass userId in state
  
  // Redirect to Google OAuth
  res.redirect(authUrl.toString());
}
