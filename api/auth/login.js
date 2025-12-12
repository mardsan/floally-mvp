/**
 * Vercel Serverless Function - User Login
 * 
 * Authenticates user and returns JWT token
 */

import { createClient } from 'redis';
import crypto from 'crypto';

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

function hashPassword(password) {
  return crypto.createHash('sha256').update(password + process.env.SALT || 'aimi-salt').digest('hex');
}

function generateToken(userId, email) {
  const payload = Buffer.from(JSON.stringify({ userId, email, exp: Date.now() + 30 * 24 * 60 * 60 * 1000 })).toString('base64');
  return payload;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        required: ['email', 'password']
      });
    }
    
    const redis = await getRedisClient();
    
    // Get userId from email
    const userId = await redis.get(`user:email:${email.toLowerCase()}`);
    if (!userId) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    // Get stored password hash
    const storedHash = await redis.get(`user:${userId}:password`);
    const providedHash = hashPassword(password);
    
    if (storedHash !== providedHash) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    // Get user data
    const userData = await redis.hGetAll(`user:${userId}`);
    
    // Update last login
    await redis.hSet(`user:${userId}`, 'lastLogin', new Date().toISOString());
    
    // Generate token
    const token = generateToken(userId, email);
    
    console.log(`✅ User logged in: ${email} (${userId})`);
    
    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        userId: userData.userId,
        email: userData.email,
        name: userData.name
      }
    });
    
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ 
      error: 'Login failed',
      message: error.message 
    });
  }
}
