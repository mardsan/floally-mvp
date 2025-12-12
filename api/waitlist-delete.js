/**
 * Vercel Serverless Function - Delete Waitlist Signup
 * 
 * Deletes a specific signup from Redis storage
 * Protected by secret token in query parameter
 * 
 * Usage: DELETE /api/waitlist-delete?secret=YOUR_SECRET&signupId=signup_123
 */

import { createClient } from 'redis';

// Create Redis client (reuse connection across invocations)
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
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  // Simple authentication with secret token
  const { secret, signupId } = req.query;
  const exportSecret = process.env.EXPORT_SECRET || 'change-me-in-production';
  
  if (secret !== exportSecret) {
    return res.status(401).json({ 
      error: 'Unauthorized',
      hint: 'Add ?secret=YOUR_SECRET to the URL'
    });
  }
  
  if (!signupId) {
    return res.status(400).json({ 
      error: 'Missing signupId parameter',
      hint: 'Add ?signupId=signup_xxx to the URL'
    });
  }
  
  try {
    const redis = await getRedisClient();
    
    // Get the signup data first (to get the email)
    const signupData = await redis.hGetAll(`waitlist:signup:${signupId}`);
    
    if (!signupData || Object.keys(signupData).length === 0) {
      return res.status(404).json({ 
        error: 'Signup not found',
        signupId: signupId
      });
    }
    
    const email = signupData.email;
    
    // Delete from sorted set
    await redis.zRem('waitlist:signups', signupId);
    
    // Delete signup data
    await redis.del(`waitlist:signup:${signupId}`);
    
    // Delete email index
    if (email) {
      await redis.del(`waitlist:email:${email.toLowerCase()}`);
    }
    
    // Decrement total count
    await redis.decr('waitlist:total');
    
    console.log(`✅ Deleted signup ${signupId} (${email})`);
    
    return res.status(200).json({
      success: true,
      message: 'Signup deleted successfully',
      signupId: signupId,
      email: email
    });
    
  } catch (error) {
    console.error('Delete error:', error);
    return res.status(500).json({ 
      error: 'Delete failed',
      message: error.message 
    });
  }
}
