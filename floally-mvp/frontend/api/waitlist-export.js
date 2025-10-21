/**
 * Vercel Serverless Function - Waitlist Export
 * 
 * TEMPORARY SOLUTION: Since Vercel logs aren't easily exportable,
 * this will store signups in a JSON file in Vercel Blob storage
 * 
 * To use:
 * 1. Install @vercel/blob: npm install @vercel/blob
 * 2. Add BLOB_READ_WRITE_TOKEN to Vercel env vars
 * 3. Update waitlist.js to write to blob storage
 * 4. Use this endpoint to export data
 */

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
  
  // TODO: Add authentication (password or secret token in query)
  // const { secret } = req.query;
  // if (secret !== process.env.EXPORT_SECRET) {
  //   return res.status(401).json({ error: 'Unauthorized' });
  // }
  
  try {
    // For now, just return instructions
    return res.status(200).json({
      message: 'Waitlist export endpoint (not yet configured)',
      instructions: [
        '1. To store signups permanently, choose a storage solution:',
        '   - Vercel KV (Redis): npm install @vercel/kv',
        '   - Vercel Blob: npm install @vercel/blob',
        '   - Google Sheets API',
        '   - Airtable API',
        '',
        '2. For now, signups are in Vercel deployment logs:',
        '   - Go to Vercel dashboard',
        '   - Click Deployments > Latest deployment',
        '   - Click Functions > /api/waitlist',
        '   - Search for "WAITLIST_SIGNUP"',
        '',
        '3. Quick win: Set up email notifications',
        '   - Use SendGrid, Resend, or AWS SES',
        '   - Get email whenever someone signs up',
        '   - No storage needed!'
      ],
      current_signups: 'Check Vercel logs',
      note: 'This endpoint will export data once storage is configured'
    });
  } catch (error) {
    console.error('Export error:', error);
    return res.status(500).json({ error: 'Export failed' });
  }
}
