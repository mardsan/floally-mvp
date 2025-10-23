/**
 * Debug endpoint to verify AI generation setup
 */

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  const checks = {
    anthropicKey: !!process.env.ANTHROPIC_API_KEY,
    anthropicKeyLength: process.env.ANTHROPIC_API_KEY?.length || 0,
    anthropicKeyPrefix: process.env.ANTHROPIC_API_KEY?.substring(0, 7) || 'not set',
    kvUrl: !!process.env.KV_REST_API_URL,
    kvToken: !!process.env.KV_REST_API_TOKEN,
    timestamp: new Date().toISOString()
  };

  return res.status(200).json({
    status: 'API route working',
    environment: process.env.VERCEL_ENV || 'unknown',
    checks
  });
}
