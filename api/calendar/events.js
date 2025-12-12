/**
 * Vercel Serverless Function - Google Calendar Events
 * 
 * Fetches calendar events for the user
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

async function refreshAccessToken(userId, refreshToken) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token'
    })
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error_description || 'Failed to refresh token');
  }
  
  // Update Redis with new access token
  const redis = await getRedisClient();
  await redis.hSet(`user:${userId}:gmail`, {
    accessToken: data.access_token,
    expiresAt: Date.now() + (data.expires_in * 1000)
  });
  
  return data.access_token;
}

async function getAccessToken(userId) {
  const redis = await getRedisClient();
  const googleData = await redis.hGetAll(`user:${userId}:gmail`);
  
  if (!googleData || !googleData.accessToken) {
    throw new Error('Google not connected');
  }
  
  // Check if token is expired
  const expiresAt = parseInt(googleData.expiresAt);
  const now = Date.now();
  
  if (expiresAt && now >= expiresAt - 60000) { // Refresh 1 min before expiry
    console.log('Access token expired, refreshing...');
    return await refreshAccessToken(userId, googleData.refreshToken);
  }
  
  return googleData.accessToken;
}

export default async function handler(req, res) {
  const { userId, timeMin, timeMax, maxResults = 10 } = req.query;
  
  if (!userId) {
    return res.status(400).json({ error: 'userId is required' });
  }
  
  try {
    const accessToken = await getAccessToken(userId);
    
    // Default to today's events if no time range specified
    const start = timeMin || new Date().toISOString();
    const end = timeMax || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    
    // Fetch calendar events from Google Calendar API
    const calendarUrl = new URL('https://www.googleapis.com/calendar/v3/calendars/primary/events');
    calendarUrl.searchParams.append('timeMin', start);
    calendarUrl.searchParams.append('timeMax', end);
    calendarUrl.searchParams.append('maxResults', maxResults);
    calendarUrl.searchParams.append('singleEvents', 'true');
    calendarUrl.searchParams.append('orderBy', 'startTime');
    
    const response = await fetch(calendarUrl, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error?.message || 'Failed to fetch calendar events');
    }
    
    // Format events for easier consumption
    const events = data.items.map(event => ({
      id: event.id,
      title: event.summary,
      description: event.description,
      start: event.start.dateTime || event.start.date,
      end: event.end.dateTime || event.end.date,
      location: event.location,
      attendees: event.attendees?.map(a => ({
        email: a.email,
        responseStatus: a.responseStatus
      })),
      status: event.status,
      htmlLink: event.htmlLink,
      isAllDay: !event.start.dateTime
    }));
    
    res.json({
      events,
      count: events.length,
      nextPageToken: data.nextPageToken
    });
    
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    res.status(500).json({ error: error.message });
  }
}
