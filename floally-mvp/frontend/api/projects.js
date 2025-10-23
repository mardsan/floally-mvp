/**
 * Vercel Serverless Function - Projects (Consolidated)
 * 
 * Handles:
 * - CRUD operations for projects (GET, POST, PUT, DELETE)
 * - AI project generation (?action=generate)
 * - Description enhancement (?action=enhance)
 */

import Anthropic from '@anthropic-ai/sdk';
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
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { action } = req.query;

  // Route to specific handler based on action
  if (action === 'generate') {
    return handleGenerate(req, res);
  } else if (action === 'enhance') {
    return handleEnhance(req, res);
  } else {
    return handleCRUD(req, res);
  }
}

// CRUD Operations Handler
async function handleCRUD(req, res) {
  const { userId } = req.query;
  
  if (!userId) {
    return res.status(400).json({ error: 'userId is required' });
  }
  
  try {
    const redis = await getRedisClient();
    
    if (req.method === 'GET') {
      // Get all projects for user
      const projectIds = await redis.sMembers(`user:${userId}:projects`);
      
      const projects = await Promise.all(
        projectIds.map(async (projectId) => {
          const data = await redis.hGetAll(`project:${projectId}`);
          return {
            ...data,
            id: projectId,
            keywords: data.keywords ? JSON.parse(data.keywords) : [],
            goals: data.goals ? JSON.parse(data.goals) : [],
            stakeholders: data.stakeholders ? JSON.parse(data.stakeholders) : []
          };
        })
      );
      
      projects.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      
      res.json({ projects });
      
    } else if (req.method === 'POST') {
      // Create new project
      const {
        name,
        description,
        goals,
        deadline,
        status,
        priority,
        keywords,
        stakeholders,
        successCriteria
      } = req.body;
      
      if (!name) {
        return res.status(400).json({ error: 'Project name is required' });
      }
      
      const projectId = `proj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const projectData = {
        id: projectId,
        userId,
        name,
        description: description || '',
        goals: JSON.stringify(goals || []),
        deadline: deadline || '',
        status: status || 'active',
        priority: priority || 'medium',
        keywords: JSON.stringify(keywords || []),
        stakeholders: JSON.stringify(stakeholders || []),
        successCriteria: successCriteria || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      await redis.hSet(`project:${projectId}`, projectData);
      await redis.sAdd(`user:${userId}:projects`, projectId);
      
      console.log(`✅ Project created: ${projectId} for user ${userId}`);
      
      res.json({
        success: true,
        project: {
          ...projectData,
          goals: goals || [],
          keywords: keywords || [],
          stakeholders: stakeholders || []
        }
      });
      
    } else if (req.method === 'PUT') {
      // Update project
      const { projectId, updates } = req.body;
      
      if (!projectId) {
        return res.status(400).json({ error: 'projectId is required' });
      }
      
      const isMember = await redis.sIsMember(`user:${userId}:projects`, projectId);
      if (!isMember) {
        return res.status(403).json({ error: 'Project not found or access denied' });
      }
      
      const updateData = {
        ...updates,
        updatedAt: new Date().toISOString()
      };
      
      if (updates.goals) updateData.goals = JSON.stringify(updates.goals);
      if (updates.keywords) updateData.keywords = JSON.stringify(updates.keywords);
      if (updates.stakeholders) updateData.stakeholders = JSON.stringify(updates.stakeholders);
      
      await redis.hSet(`project:${projectId}`, updateData);
      
      res.json({ success: true });
      
    } else if (req.method === 'DELETE') {
      // Delete project
      const { projectId } = req.body;
      
      if (!projectId) {
        return res.status(400).json({ error: 'projectId is required' });
      }
      
      const isMember = await redis.sIsMember(`user:${userId}:projects`, projectId);
      if (!isMember) {
        return res.status(403).json({ error: 'Project not found or access denied' });
      }
      
      await redis.del(`project:${projectId}`);
      await redis.sRem(`user:${userId}:projects`, projectId);
      
      console.log(`🗑️ Project deleted: ${projectId}`);
      
      res.json({ success: true });
      
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
    
  } catch (error) {
    console.error('Error managing projects:', error);
    res.status(500).json({ error: error.message });
  }
}

// AI Generation Handler
async function handleGenerate(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId, projectDescription, projectName, deadline, priority, existingData } = req.body;

    if (!userId || !projectDescription) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

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

    let timeContext = '';
    if (deadline) {
      const deadlineDate = new Date(deadline);
      const now = new Date();
      const daysUntilDeadline = Math.ceil((deadlineDate - now) / (1000 * 60 * 60 * 24));
      
      if (daysUntilDeadline > 0) {
        timeContext = `\nDeadline: ${deadline} (${daysUntilDeadline} days from now)`;
        if (daysUntilDeadline < 30) {
          timeContext += `\n⚠️ IMPORTANT: This is a tight deadline. Prioritize MVP features and realistic scope.`;
        }
      } else if (daysUntilDeadline < 0) {
        timeContext = `\nDeadline: ${deadline} (${Math.abs(daysUntilDeadline)} days overdue - needs immediate action)`;
      }
    }

    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    const modelName = process.env.ANTHROPIC_MODEL || 'claude-3-haiku-20240307';

    const systemPrompt = `You are Aimy, an AI project planning assistant. Help users break down their projects into actionable goals and context.

${profileContext}${timeContext}
Priority Level: ${priority || 'medium'}

Provide your response in this exact JSON structure:
{
  "goals": ["Goal 1", "Goal 2", "Goal 3"],
  "tasks": ["Task 1", "Task 2"],
  "keywords": ["keyword1", "keyword2"],
  "stakeholders": ["stakeholder1", "stakeholder2"],
  "successMetrics": ["metric1", "metric2"],
  "recommendedTimeline": "${deadline ? `"Phased approach adjusted for ${deadline.includes('-') ? Math.ceil((new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24)) : ''} days"` : '"Suggest realistic timeline with phases"'}"
}`;

    const userMessage = `Project: ${projectName || 'Untitled'}\n\nDescription: ${projectDescription}\n\n${existingData ? `Existing context: ${JSON.stringify(existingData)}` : ''}`;

    const message = await anthropic.messages.create({
      model: modelName,
      max_tokens: 2000,
      temperature: 0.7,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }]
    });

    const textContent = message.content.find(block => block.type === 'text');
    if (!textContent) {
      throw new Error('No text content in Claude response');
    }

    const jsonMatch = textContent.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }

    const suggestions = JSON.parse(jsonMatch[0]);

    res.status(200).json({
      success: true,
      suggestions
    });

  } catch (error) {
    console.error('Error generating project:', error);
    res.status(500).json({ 
      error: 'Failed to generate project suggestions',
      details: error.message 
    });
  }
}

// Description Enhancement Handler
async function handleEnhance(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId, projectDescription, projectName } = req.body;

    if (!userId || !projectDescription) {
      return res.status(400).json({ error: 'Missing required fields', userId: !!userId, hasDescription: !!projectDescription });
    }

    console.log('Enhancing description for user:', userId);

    // Check if API key is available
    if (!process.env.ANTHROPIC_API_KEY) {
      console.error('ANTHROPIC_API_KEY not configured');
      return res.status(500).json({ error: 'AI service not configured', details: 'ANTHROPIC_API_KEY missing' });
    }

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

    console.log('Calling Claude API for enhancement...');

    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    const modelName = process.env.ANTHROPIC_MODEL || 'claude-3-haiku-20240307';

    const systemPrompt = `You are Aimy, an AI project planning assistant. Analyze the project description and provide comprehensive planning information.

${profileContext}

Provide your response in this exact JSON structure:
{
  "enhancedDescription": "Clear, detailed project description with specific scope and components",
  "estimatedDuration": "e.g., '2-3 months', '6 weeks', '3-4 months'",
  "complexity": "simple|moderate|complex|very-complex",
  "recommendedTimeline": "Specific suggestion like 'Start with 3-month MVP, then iterate'",
  "goals": ["Specific measurable goal 1", "Specific measurable goal 2", "Specific measurable goal 3"],
  "keywords": ["keyword1", "keyword2", "keyword3"],
  "stakeholders": ["stakeholder1", "stakeholder2"],
  "successMetrics": ["metric1", "metric2", "metric3"],
  "keyComponents": ["Component 1", "Component 2", "Component 3"],
  "potentialChallenges": ["Challenge 1", "Challenge 2"]
}`;

    const userMessage = `Project Name: ${projectName || 'Untitled Project'}

Original Description:
${projectDescription}

Please analyze this project description and provide an enhanced version with clear scope, realistic timeline assessment, and key components.`;

    const message = await anthropic.messages.create({
      model: modelName,
      max_tokens: 4000,
      temperature: 0.7,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }]
    });

    console.log('Claude API response received');

    const textContent = message.content.find(block => block.type === 'text');
    if (!textContent) {
      throw new Error('No text content in Claude response');
    }

    const jsonMatch = textContent.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('Claude response text:', textContent.text);
      throw new Error('No JSON found in response');
    }

    const result = JSON.parse(jsonMatch[0]);

    if (!result.enhancedDescription || !result.estimatedDuration) {
      console.error('Invalid response structure:', result);
      throw new Error('Missing required fields in Claude response');
    }

    console.log('Enhancement successful');

    res.status(200).json({
      success: true,
      enhancement: result
    });

  } catch (error) {
    console.error('Error enhancing description:', error);
    res.status(500).json({ 
      error: 'Failed to enhance description',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}
