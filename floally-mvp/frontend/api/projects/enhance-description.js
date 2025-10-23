import Anthropic from '@anthropic-ai/sdk';
import { createClient } from 'redis';

let redisClient = null;

async function getRedisClient() {
  if (!redisClient) {
    redisClient = createClient({
      url: process.env.KV_URL
    });
    await redisClient.connect();
  }
  return redisClient;
}

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId, projectDescription, projectName } = req.body;

    if (!userId || !projectDescription) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Get user profile for context
    const redis = await getRedisClient();
    const userProfileKey = `user:${userId}:profile`;
    const userProfile = await redis.get(userProfileKey);
    
    let profileContext = '';
    if (userProfile) {
      const profile = JSON.parse(userProfile);
      profileContext = `User Context:
- Role: ${profile.role || 'Not specified'}
- Work Style: ${profile.workStyle || 'Not specified'}
- Top Priorities: ${profile.priorities?.join(', ') || 'Not specified'}
`;
    }

    // Initialize Anthropic client
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    // Use extended thinking with Claude for deeper reasoning
    const modelName = process.env.ANTHROPIC_MODEL || 'claude-3-haiku-20240307';

    const systemPrompt = `You are Aimy, an AI project planning assistant. Your role is to help users clarify and enhance their project descriptions by:

1. **Clarifying scope and objectives** - What exactly are they trying to build/achieve?
2. **Assessing scale and ambition** - Is this a weekend prototype, a 3-month MVP, or a year-long enterprise project?
3. **Identifying key components** - What are the major features or phases?
4. **Providing realistic timeline** - Based on the scope, what's a reasonable completion timeframe?
5. **Highlighting potential challenges** - What might be complex or time-consuming?

${profileContext}

Your output should be a well-structured, enhanced project description that:
- Is clear and specific about what will be built
- Breaks down major components or phases
- Is realistic about scope
- Provides context for timeline estimation

**CRITICAL: Use extended thinking (<Thinking></Thinking>) to reason through:**
- What is the true scope and complexity of this project?
- What are the dependencies and critical path items?
- What would be a realistic timeline given the described scope?
- Are there any red flags or overly ambitious aspects?
- What might the user not be considering?

Then provide your response in this exact JSON structure:
{
  "enhancedDescription": "Clear, detailed project description with specific scope and components",
  "reasoning": "Brief explanation of your assessment and why you structured it this way",
  "estimatedDuration": "e.g., '2-3 months', '6 weeks', '3-4 months'",
  "complexity": "simple|moderate|complex|very-complex",
  "recommendedTimeline": "Specific suggestion like 'Start with 3-month MVP, then iterate' or '6-week sprint for core features'",
  "keyComponents": ["Component 1", "Component 2", "Component 3"],
  "potentialChallenges": ["Challenge 1", "Challenge 2"]
}`;

    const userMessage = `Project Name: ${projectName || 'Untitled Project'}

Original Description:
${projectDescription}

Please analyze this project description and provide an enhanced version with clear scope, realistic timeline assessment, and key components. Use extended thinking to reason through the true complexity and requirements.`;

    console.log('Calling Claude API for description enhancement...');
    
    const message = await anthropic.messages.create({
      model: modelName,
      max_tokens: 4000,
      temperature: 0.7,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: userMessage
        }
      ]
    });

    console.log('Claude API response received');

    // Extract the text content
    const textContent = message.content.find(block => block.type === 'text');
    if (!textContent) {
      throw new Error('No text content in Claude response');
    }

    // Parse the JSON response
    let result;
    try {
      // Extract JSON from the response (it might be wrapped in markdown code blocks)
      const jsonMatch = textContent.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Failed to parse Claude response:', textContent.text);
      throw new Error('Invalid JSON response from Claude');
    }

    // Validate required fields
    if (!result.enhancedDescription || !result.estimatedDuration) {
      throw new Error('Missing required fields in Claude response');
    }

    res.status(200).json({
      success: true,
      enhancement: result
    });

  } catch (error) {
    console.error('Error enhancing description:', error);
    res.status(500).json({ 
      error: 'Failed to enhance description',
      details: error.message 
    });
  }
}
