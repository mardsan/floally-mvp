// Vercel Serverless Function for Waitlist Signups
// Uses Redis for permanent storage

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
  // CORS headers for heyaimi.com
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const { email, name, struggle, timestamp } = req.body;
    
    // Validate required fields
    if (!email || !name || !struggle) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        required: ['email', 'name', 'struggle']
      });
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }
    
    // Create signup object with metadata
    const signupData = {
      email,
      name,
      struggle,
      timestamp: timestamp || new Date().toISOString(),
      source: 'heyaimi.com',
      ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
      userAgent: req.headers['user-agent'],
      signupId: `signup_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
    
    // Store in Redis
    try {
      const redis = await getRedisClient();
      
      // Add to waitlist sorted set with timestamp as score
      await redis.zAdd('waitlist:signups', {
        score: Date.now(),
        value: signupData.signupId
      });
      
      // Store full signup data as hash
      await redis.hSet(`waitlist:signup:${signupData.signupId}`, signupData);
      
      // Keep email index for duplicate checking
      await redis.set(`waitlist:email:${email.toLowerCase()}`, signupData.signupId);
      
      // Increment total count
      const totalSignups = await redis.incr('waitlist:total');
      
      console.log(`✅ Stored signup ${signupData.signupId} (Total: ${totalSignups})`);
      
      // Return success with position
      return res.status(200).json({
        success: true,
        message: `Welcome to the waitlist, ${name}!`,
        email: email,
        position: totalSignups,
        note: `You're signup #${totalSignups} for early access to Hey Aimi!`
      });
      
    } catch (kvError) {
      console.error('Redis storage error:', kvError);
      // Log to console as fallback
      console.log('WAITLIST_SIGNUP_FALLBACK:', JSON.stringify(signupData));
      
      // Still return success to user even if storage fails
      return res.status(200).json({
        success: true,
        message: `Welcome to the waitlist, ${name}!`,
        email: email,
        position: 'tracked',
        note: 'Signup recorded! Check back soon.'
      });
    }
    
  } catch (error) {
    console.error('Waitlist signup error:', error);
    return res.status(500).json({ 
      error: 'Failed to process signup',
      message: error.message 
    });
  }
}
