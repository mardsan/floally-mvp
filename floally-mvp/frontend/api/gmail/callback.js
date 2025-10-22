/**
 * Vercel Serverless Function - Google OAuth Callback
 * 
 * Handles the OAuth callback from Google
 * Exchanges auth code for access token
 * Stores tokens in Redis for Gmail + Calendar access
 */

import { createClient } from 'redis';

let redisClient = null;

async function getRedisClient() {
  if (!redisClient) {
    const redisUrl = process.env.KV_URL || process.env.REDIS_URL;
    if (!redisUrl) {
      throw new Error('Redis URL not configured');
    }
    
    redisClient = createClient({ url: redisUrl });
    await redisClient.connect();
  }
  return redisClient;
}

export default async function handler(req, res) {
  const { code, state: userId, error } = req.query;
  
  // Handle OAuth errors
  if (error) {
    return res.redirect(`/app?error=${encodeURIComponent(error)}`);
  }
  
  if (!code || !userId) {
    return res.redirect('/app?error=missing_parameters');
  }
  
  try {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    
    // Build redirect URI - handle VERCEL_URL which doesn't include protocol
    let redirectUri;
    if (process.env.VERCEL_URL) {
      redirectUri = `https://${process.env.VERCEL_URL}/api/gmail/callback`;
    } else {
      redirectUri = 'https://okaimy.com/api/gmail/callback';
    }
    
    if (!clientId || !clientSecret) {
      throw new Error('Google OAuth credentials not configured');
    }
    
    // Exchange code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code'
      })
    });
    
    const tokens = await tokenResponse.json();
    
    if (!tokenResponse.ok) {
      throw new Error(tokens.error_description || 'Failed to get tokens');
    }
    
    // Get user info from Google
    const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` }
    });
    
    const userInfo = await userInfoResponse.json();
    
    // Store tokens in Redis
    const redis = await getRedisClient();
    
    // Check if scopes include calendar
    const hasCalendar = tokens.scope.includes('calendar');
    
    const tokenData = {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiresAt: Date.now() + (tokens.expires_in * 1000),
      scope: tokens.scope,
      gmailEmail: userInfo.email,
      gmailName: userInfo.name,
      gmailPicture: userInfo.picture,
      connectedAt: new Date().toISOString(),
      hasGmail: tokens.scope.includes('gmail'),
      hasCalendar: hasCalendar
    };
    
    await redis.hSet(`user:${userId}:gmail`, tokenData);
    
    // Update user record
    await redis.hSet(`user:${userId}`, {
      gmailConnected: 'true',
      gmailEmail: userInfo.email,
      calendarConnected: hasCalendar ? 'true' : 'false'
    });
    
    console.log(`✅ Google services connected for user ${userId} (${userInfo.email})`);
    console.log(`   - Gmail: ${tokenData.hasGmail}`);
    console.log(`   - Calendar: ${hasCalendar}`);
    
    // Redirect back to app
    res.redirect('/app?google=connected');
    
  } catch (error) {
    console.error('OAuth callback error:', error);
    res.redirect(`/app?error=${encodeURIComponent(error.message)}`);
  }
}
