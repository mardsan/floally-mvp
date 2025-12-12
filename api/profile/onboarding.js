/**
 * Vercel Serverless Function - User Profile/Onboarding
 * 
 * Saves user profile data from onboarding flow
 * This provides Aimy with context to personalize assistance
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
  if (req.method === 'POST') {
    // Save/update profile
    const { userId, profile, completedAt } = req.body;
    
    if (!userId || !profile) {
      return res.status(400).json({ error: 'userId and profile are required' });
    }
    
    try {
      const redis = await getRedisClient();
      
      // Store profile data
      const profileData = {
        // Basic info
        displayName: profile.display_name || '',
        role: profile.role || '',
        
        // Work preferences
        priorities: JSON.stringify(profile.priorities || []),
        decisionStyle: profile.decision_style || '',
        communicationStyle: profile.communication_style || '',
        unsubscribePreference: profile.unsubscribe_preference || '',
        workHours: JSON.stringify(profile.work_hours || { start: '09:00', end: '18:00' }),
        
        // Meta
        onboardingCompleted: 'true',
        onboardingCompletedAt: completedAt || new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      };
      
      await redis.hSet(`user:${userId}:profile`, profileData);
      
      // Update user record
      await redis.hSet(`user:${userId}`, {
        profileCompleted: 'true',
        displayName: profile.display_name || ''
      });
      
      console.log(`✅ Profile saved for user ${userId}`);
      
      res.json({ success: true, profile: profileData });
      
    } catch (error) {
      console.error('Error saving profile:', error);
      res.status(500).json({ error: error.message });
    }
    
  } else if (req.method === 'GET') {
    // Get profile
    const { userId } = req.query;
    
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }
    
    try {
      const redis = await getRedisClient();
      const profileData = await redis.hGetAll(`user:${userId}:profile`);
      
      if (!profileData || Object.keys(profileData).length === 0) {
        return res.json({ exists: false });
      }
      
      // Parse JSON fields
      const profile = {
        ...profileData,
        priorities: profileData.priorities ? JSON.parse(profileData.priorities) : [],
        workHours: profileData.workHours ? JSON.parse(profileData.workHours) : { start: '09:00', end: '18:00' }
      };
      
      res.json({ exists: true, profile });
      
    } catch (error) {
      console.error('Error fetching profile:', error);
      res.status(500).json({ error: error.message });
    }
    
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
