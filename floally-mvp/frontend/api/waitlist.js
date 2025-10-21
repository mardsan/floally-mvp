// Vercel Serverless Function for Waitlist Signups
// Uses Vercel KV (Redis) for permanent storage

import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  // CORS headers for okaimy.com
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
      source: 'okaimy.com',
      ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
      userAgent: req.headers['user-agent'],
      signupId: `signup_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
    
    // Store in Vercel KV (Redis)
    try {
      // Add to waitlist set with email as score (for uniqueness)
      await kv.zadd('waitlist:signups', {
        score: Date.now(),
        member: signupData.signupId
      });
      
      // Store full signup data
      await kv.hset(`waitlist:signup:${signupData.signupId}`, signupData);
      
      // Keep email index for duplicate checking
      await kv.set(`waitlist:email:${email.toLowerCase()}`, signupData.signupId);
      
      // Increment total count
      const totalSignups = await kv.incr('waitlist:total');
      
      console.log(`✅ Stored signup ${signupData.signupId} (Total: ${totalSignups})`);
      
      // Also send to Google Sheets if configured (as backup)
      const sheetUrl = process.env.GOOGLE_SHEET_URL;
      if (sheetUrl) {
        try {
          const formData = new URLSearchParams({
            Email: email,
            Name: name,
            Struggle: struggle,
            Timestamp: signupData.timestamp
          });
          
          await fetch(sheetUrl, {
            method: 'POST',
            body: formData,
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            }
          });
          
          console.log('✅ Backup sent to Google Sheets');
        } catch (sheetError) {
          console.error('Google Sheets backup error:', sheetError);
        }
      }
      
    } catch (kvError) {
      console.error('Vercel KV storage error:', kvError);
      // Log to console as fallback
      console.log('WAITLIST_SIGNUP_FALLBACK:', JSON.stringify(signupData));
      // Don't fail the request - still return success to user
    }
    
    // Get total signups for position
    let position = 'tracked';
    try {
      const total = await kv.get('waitlist:total');
      position = total || 1;
    } catch (e) {
      console.error('Error getting position:', e);
    }
    
    // Return success
    return res.status(200).json({
      success: true,
      message: `Welcome to the waitlist, ${name}!`,
      email: email,
      position: position,
      note: `You're signup #${position} for early access to OkAimy!`
    });
    
  } catch (error) {
    console.error('Waitlist signup error:', error);
    return res.status(500).json({ 
      error: 'Failed to process signup',
      message: error.message 
    });
  }
}
