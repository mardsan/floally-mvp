/**
 * Vercel Serverless Function - Gmail Connection Status
 * 
 * Checks if user has connected their Gmail account
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
    
    // Check if Gmail tokens exist
    const gmailData = await redis.hGetAll(`user:${userId}:gmail`);
    
    const connected = gmailData && gmailData.accessToken;
    
    if (connected) {
      return res.json({
        connected: true,
        email: gmailData.gmailEmail,
        connectedAt: gmailData.connectedAt
      });
    }
    
    return res.json({ connected: false });
    
  } catch (error) {
    console.error('Error checking Gmail status:', error);
    res.status(500).json({ error: 'Failed to check Gmail status' });
  }
}
