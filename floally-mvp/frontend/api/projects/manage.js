/**
 * Vercel Serverless Function - Projects Management
 * 
 * CRUD operations for user projects
 * Projects provide context lenses for Aimy to analyze emails, calendar, and other data
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
      
      // Sort by creation date (newest first)
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
      
      // Verify project belongs to user
      const isMember = await redis.sIsMember(`user:${userId}:projects`, projectId);
      if (!isMember) {
        return res.status(403).json({ error: 'Project not found or access denied' });
      }
      
      // Prepare updates
      const updateData = {
        ...updates,
        updatedAt: new Date().toISOString()
      };
      
      // Stringify arrays
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
      
      // Verify project belongs to user
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
