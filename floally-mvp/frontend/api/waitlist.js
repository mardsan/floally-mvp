// Vercel Serverless Function for Waitlist Signups
// This bypasses Railway backend which is currently unstable

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
    
    // For now, we'll use Vercel's edge config or KV storage
    // As a simple fallback, we can log to Vercel logs and send to a webhook
    
    // Log signup for Vercel logs (you can view these in Vercel dashboard)
    console.log('WAITLIST_SIGNUP:', JSON.stringify({
      email,
      name,
      struggle,
      timestamp: timestamp || new Date().toISOString(),
      source: 'vercel_serverless',
      ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
      userAgent: req.headers['user-agent']
    }));
    
    // TODO: Send to a spreadsheet, Airtable, or email service
    // For production, integrate with:
    // - Vercel KV: await kv.lpush('waitlist', { email, name, struggle, timestamp })
    // - EmailOctopus API
    // - Google Sheets API
    // - Airtable API
    
    // Return success
    return res.status(200).json({
      success: true,
      message: `Welcome to the waitlist, ${name}!`,
      email: email,
      position: 'tracked',
      note: 'Check Vercel deployment logs to see signups'
    });
    
  } catch (error) {
    console.error('Waitlist signup error:', error);
    return res.status(500).json({ 
      error: 'Failed to process signup',
      message: error.message 
    });
  }
}
