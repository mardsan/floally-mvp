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
    
    // Send to Google Sheets (if configured)
    // To enable: Set GOOGLE_SHEET_URL env var in Vercel dashboard
    // Instructions: https://github.com/jamiewilson/form-to-google-sheets
    const sheetUrl = process.env.GOOGLE_SHEET_URL;
    if (sheetUrl) {
      try {
        const formData = new URLSearchParams({
          Email: email,
          Name: name,
          Struggle: struggle,
          Timestamp: timestamp || new Date().toISOString()
        });
        
        await fetch(sheetUrl, {
          method: 'POST',
          body: formData,
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        });
        
        console.log('✅ Sent to Google Sheets');
      } catch (sheetError) {
        console.error('Google Sheets error:', sheetError);
        // Don't fail the signup if sheets fails
      }
    } else {
      console.log('ℹ️ Google Sheets not configured (set GOOGLE_SHEET_URL env var)');
    }
    
    // Return success
    return res.status(200).json({
      success: true,
      message: `Welcome to the waitlist, ${name}!`,
      email: email,
      position: 'tracked',
      note: 'Signup recorded! You can view in Vercel logs or set up email notifications.'
    });
    
  } catch (error) {
    console.error('Waitlist signup error:', error);
    return res.status(500).json({ 
      error: 'Failed to process signup',
      message: error.message 
    });
  }
}
