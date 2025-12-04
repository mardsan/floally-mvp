/**
 * Vercel Serverless Function - User Signup
 * 
 * Creates a new user account and stores in Redis
 * Returns JWT token for authentication
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

// Simple password hashing (use bcrypt in production)
function hashPassword(password) {
  return crypto.createHash('sha256').update(password + process.env.SALT || 'aimi-salt').digest('hex');
}

// Simple JWT-like token generation
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
    const { email, password, name } = req.body;
    
    if (!email || !password || !name) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        required: ['email', 'password', 'name']
      });
    }
    
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }
    
    const redis = await getRedisClient();
    
    // Check if user already exists
    const existingUser = await redis.get(`user:email:${email.toLowerCase()}`);
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }
    
    // Create user
    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const hashedPassword = hashPassword(password);
    
    const userData = {
      userId,
      email: email.toLowerCase(),
      name,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString()
    };
    
    // Store user data (without password in main record)
    await redis.hSet(`user:${userId}`, userData);
    
    // Store password separately
    await redis.set(`user:${userId}:password`, hashedPassword);
    
    // Email to userId index
    await redis.set(`user:email:${email.toLowerCase()}`, userId);
    
    // Generate token
    const token = generateToken(userId, email);
    
    console.log(`✅ Created user: ${email} (${userId})`);
    
    return res.status(201).json({
      success: true,
      message: 'Account created successfully',
      token,
      user: {
        userId,
        email: userData.email,
        name: userData.name
      }
    });
    
  } catch (error) {
    console.error('Signup error:', error);
    return res.status(500).json({ 
      error: 'Signup failed',
      message: error.message 
    });
  }
}
