/**
 * Vercel Serverless Function - Waitlist Export
 * 
 * Exports all waitlist signups from Redis storage
 * Protected by secret token in query parameter
 * 
 * Usage: /api/waitlist-export?secret=YOUR_SECRET
 * Set EXPORT_SECRET env var in Vercel dashboard
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
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  // Simple authentication with secret token
  const { secret, format = 'json' } = req.query;
  const exportSecret = process.env.EXPORT_SECRET || 'change-me-in-production';
  
  if (secret !== exportSecret) {
    return res.status(401).json({ 
      error: 'Unauthorized',
      hint: 'Add ?secret=YOUR_SECRET to the URL (set EXPORT_SECRET in Vercel env vars)'
    });
  }
  
  try {
    const redis = await getRedisClient();
    
    // Get total count
    const total = await redis.get('waitlist:total');
    const totalCount = parseInt(total) || 0;
    
    // Get all signup IDs (sorted by timestamp)
    const signupIds = await redis.zRange('waitlist:signups', 0, -1);
    
    // Fetch all signup data
    const signups = [];
    for (const signupId of signupIds) {
      const data = await redis.hGetAll(`waitlist:signup:${signupId}`);
      if (data && Object.keys(data).length > 0) {
        signups.push(data);
      }
    }
    
    // Sort by timestamp (newest first)
    signups.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    // Return based on format
    if (format === 'csv') {
      // Generate CSV
      const headers = ['Email', 'Name', 'Struggle', 'Timestamp', 'Source', 'IP'];
      const rows = signups.map(s => [
        s.email || '',
        s.name || '',
        s.struggle || '',
        s.timestamp || '',
        s.source || '',
        s.ip || ''
      ]);
      
      const csv = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="okaimy-waitlist.csv"');
      return res.status(200).send(csv);
    }
    
    // Default: JSON format
    return res.status(200).json({
      success: true,
      total: totalCount,
      signups: signups,
      exported_at: new Date().toISOString(),
      note: 'Add ?format=csv to download as CSV file'
    });
    
  } catch (error) {
    console.error('Export error:', error);
    return res.status(500).json({ 
      error: 'Export failed',
      message: error.message 
    });
  }
}
