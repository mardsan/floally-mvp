/**
 * Vercel Serverless Function - Google Services Connection Status
 * 
 * Checks if user has connected Gmail and/or Calendar
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
  const { userId } = req.query;
  
  if (!userId) {
    return res.status(400).json({ error: 'userId is required' });
  }
  
  try {
    const redis = await getRedisClient();
    
    // Check if Google tokens exist
    const googleData = await redis.hGetAll(`user:${userId}:gmail`);
    
    const connected = googleData && googleData.accessToken;
    
    if (connected) {
      return res.json({
        connected: true,
        email: googleData.gmailEmail,
        connectedAt: googleData.connectedAt,
        hasGmail: googleData.hasGmail === 'true' || googleData.scope?.includes('gmail'),
        hasCalendar: googleData.hasCalendar === 'true' || googleData.scope?.includes('calendar')
      });
    }
    
    return res.json({ 
      connected: false,
      hasGmail: false,
      hasCalendar: false
    });
    
  } catch (error) {
    console.error('Error checking Google services status:', error);
    res.status(500).json({ error: 'Failed to check connection status' });
  }
}
