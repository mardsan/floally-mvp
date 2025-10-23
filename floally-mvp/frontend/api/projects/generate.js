/**
 * AI-Powered Project Generation Endpoint
 * Uses Claude to help users think through their projects
 */

import Anthropic from '@anthropic-ai/sdk';
import { createClient } from 'redis';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

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
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId, projectDescription, projectName, existingData } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    if (!projectDescription || projectDescription.trim().length < 10) {
      return res.status(400).json({ 
        error: 'Please provide a more detailed project description (at least 10 characters)' 
      });
    }

    // Fetch user profile for context
    const redis = await getRedisClient();
    const userProfile = await redis.hGetAll(`user:${userId}:profile`);
    
    // Build context-aware prompt
    const systemPrompt = `You are Aimy, an AI assistant helping a user structure their project. Your role is to help them think through their goals, tasks, and success metrics in a thoughtful, collaborative way.

User Context:
- Role: ${userProfile?.role || 'Not specified'}
- Work Style: ${userProfile?.workStyle || 'Not specified'}
- Priorities: ${userProfile?.priorities || 'Not specified'}

Your task is to analyze the project description and generate:
1. **Goals** (3-5 concrete, achievable objectives)
2. **Tasks** (5-8 specific action items to accomplish the goals)
3. **Keywords** (5-10 relevant terms for filtering emails/meetings)
4. **Stakeholders** (3-6 people/roles who should be involved)
5. **Success Metrics** (3-4 ways to measure project success)

Important:
- Be specific and actionable
- Match the user's work style and priorities
- Use industry-appropriate language
- Focus on what's realistic and achievable
- Make it easy for the user to edit and refine

Return ONLY a valid JSON object with this exact structure:
{
  "goals": ["goal1", "goal2", ...],
  "tasks": ["task1", "task2", ...],
  "keywords": ["keyword1", "keyword2", ...],
  "stakeholders": ["stakeholder1", "stakeholder2", ...],
  "successMetrics": ["metric1", "metric2", ...]
}`;

    const userMessage = `Project Name: ${projectName || 'Untitled Project'}

Project Description:
${projectDescription}

${existingData ? `\nExisting Data (user has already added some information):
${JSON.stringify(existingData, null, 2)}` : ''}

Please analyze this project and help me structure it with goals, tasks, keywords, stakeholders, and success metrics.`;

    console.log('Calling Claude API for project generation...');

    const response = await anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 2000,
      temperature: 0.7,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: userMessage
        }
      ]
    });

    // Extract JSON from Claude's response
    const content = response.content[0].text;
    console.log('Claude response:', content);

    // Try to parse JSON from response
    let generatedData;
    try {
      // Look for JSON in the response (Claude might wrap it in explanation)
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        generatedData = JSON.parse(jsonMatch[0]);
      } else {
        generatedData = JSON.parse(content);
      }
    } catch (parseError) {
      console.error('Failed to parse Claude response as JSON:', parseError);
      return res.status(500).json({ 
        error: 'Failed to parse AI response',
        rawResponse: content 
      });
    }

    // Validate the structure
    const requiredFields = ['goals', 'tasks', 'keywords', 'stakeholders', 'successMetrics'];
    const missingFields = requiredFields.filter(field => !generatedData[field]);
    
    if (missingFields.length > 0) {
      return res.status(500).json({ 
        error: `AI response missing fields: ${missingFields.join(', ')}`,
        rawResponse: content 
      });
    }

    // Log usage for monitoring
    console.log(`Project generation for user ${userId}:`, {
      inputTokens: response.usage.input_tokens,
      outputTokens: response.usage.output_tokens,
      projectName,
      descriptionLength: projectDescription.length
    });

    return res.status(200).json({
      success: true,
      suggestions: generatedData,
      usage: {
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens
      }
    });

  } catch (error) {
    console.error('Project generation error:', error);
    
    // Handle specific Anthropic API errors
    if (error.status === 401) {
      return res.status(500).json({ 
        error: 'AI service authentication failed. Please contact support.' 
      });
    }
    
    if (error.status === 429) {
      return res.status(429).json({ 
        error: 'Too many requests. Please try again in a moment.' 
      });
    }

    return res.status(500).json({ 
      error: 'Failed to generate project suggestions',
      details: error.message 
    });
  }
}
