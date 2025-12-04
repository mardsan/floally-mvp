/**
 * useActivityLogger Hook
 * 
 * Automatic activity tracking for Aimi's learning system
 * 
 * Usage:
 * ```
 * const { logActivity, logMultiple } = useActivityLogger(userEmail);
 * 
 * // Log single event
 * logActivity('project_created', 'project', projectId, { name: 'New Project' });
 * 
 * // Log multiple events
 * logMultiple([
 *   { event_type: 'task_completed', entity_type: 'task', entity_id: taskId },
 *   { event_type: 'standup_viewed', entity_type: 'standup', action: 'viewed' }
 * ]);
 * ```
 */

import { useCallback } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export function useActivityLogger(userEmail) {
  /**
   * Log a single activity event
   */
  const logActivity = useCallback(async (
    eventType,
    entityType,
    entityId = null,
    metadata = null,
    action = 'performed'
  ) => {
    if (!userEmail) {
      console.warn('useActivityLogger: No user email provided');
      return;
    }

    try {
      await axios.post(`${API_URL}/api/activity/log`, {
        events: [{
          user_email: userEmail,
          event_type: eventType,
          entity_type: entityType,
          entity_id: entityId,
          action: action,
          metadata: metadata,
          timestamp: new Date().toISOString()
        }]
      });
    } catch (error) {
      console.error('Failed to log activity:', error);
      // Silent fail - don't interrupt user experience
    }
  }, [userEmail]);

  /**
   * Log multiple activity events in a single request
   */
  const logMultiple = useCallback(async (events) => {
    if (!userEmail) {
      console.warn('useActivityLogger: No user email provided');
      return;
    }

    try {
      await axios.post(`${API_URL}/api/activity/log`, {
        events: events.map(event => ({
          user_email: userEmail,
          event_type: event.event_type,
          entity_type: event.entity_type,
          entity_id: event.entity_id || null,
          action: event.action || 'performed',
          metadata: event.metadata || null,
          timestamp: event.timestamp || new Date().toISOString()
        }))
      });
    } catch (error) {
      console.error('Failed to log activities:', error);
      // Silent fail - don't interrupt user experience
    }
  }, [userEmail]);

  /**
   * Get daily summary
   */
  const getDailySummary = useCallback(async (date = null) => {
    if (!userEmail) return null;
    
    try {
      const params = date ? `?date=${date}` : '';
      const response = await axios.get(`${API_URL}/api/activity/daily-summary?user_email=${userEmail}${params}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get daily summary:', error);
      return null;
    }
  }, [userEmail]);

  /**
   * Get weekly patterns
   */
  const getWeeklyPatterns = useCallback(async () => {
    if (!userEmail) return null;
    
    try {
      const response = await axios.get(`${API_URL}/api/activity/weekly-patterns?user_email=${userEmail}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get weekly patterns:', error);
      return null;
    }
  }, [userEmail]);

  /**
   * Get AI learning status
   */
  const getLearningStatus = useCallback(async () => {
    if (!userEmail) return null;
    
    try {
      const response = await axios.get(`${API_URL}/api/activity/learning-status?user_email=${userEmail}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get learning status:', error);
      return null;
    }
  }, [userEmail]);

  return {
    logActivity,
    logMultiple,
    getDailySummary,
    getWeeklyPatterns,
    getLearningStatus
  };
}

/**
 * Event Type Constants
 * Use these for consistency across the app
 */
export const EVENT_TYPES = {
  // Email events
  EMAIL_READ: 'email_read',
  EMAIL_RESPONDED: 'email_responded',
  EMAIL_ARCHIVED: 'email_archived',
  EMAIL_STARRED: 'email_starred',
  EMAIL_DELETED: 'email_deleted',
  
  // Project events
  PROJECT_CREATED: 'project_created',
  PROJECT_UPDATED: 'project_updated',
  PROJECT_DELETED: 'project_deleted',
  PROJECT_VIEWED: 'project_viewed',
  PROJECT_STATUS_CHANGED: 'project_status_changed',
  
  // Task events
  TASK_CREATED: 'task_created',
  TASK_COMPLETED: 'task_completed',
  TASK_UPDATED: 'task_updated',
  TASK_DELETED: 'task_deleted',
  SUBTASK_COMPLETED: 'subtask_completed',
  
  // Standup events
  STANDUP_GENERATED: 'standup_generated',
  STANDUP_VIEWED: 'standup_viewed',
  STANDUP_TASK_STARTED: 'standup_task_started',
  STANDUP_TASK_COMPLETED: 'standup_task_completed',
  STANDUP_STATUS_CHANGED: 'standup_status_changed',
  
  // Contact events
  CONTACT_TRUSTED: 'contact_trusted',
  CONTACT_BLOCKED: 'contact_blocked',
  CONTACT_UPDATED: 'contact_updated',
  
  // AI interaction events
  AI_SUGGESTION_ACCEPTED: 'ai_suggestion_accepted',
  AI_SUGGESTION_REJECTED: 'ai_suggestion_rejected',
  AI_WIZARD_USED: 'ai_wizard_used',
  AI_FEEDBACK_PROVIDED: 'ai_feedback_provided',
  
  // Calendar events
  CALENDAR_EVENT_VIEWED: 'calendar_event_viewed',
  CALENDAR_EVENT_CREATED: 'calendar_event_created',
  
  // Settings events
  SETTINGS_UPDATED: 'settings_updated',
  PROFILE_UPDATED: 'profile_updated',
  ONBOARDING_COMPLETED: 'onboarding_completed',
  
  // Navigation events
  PAGE_VIEWED: 'page_viewed',
  FEATURE_DISCOVERED: 'feature_discovered'
};

/**
 * Entity Type Constants
 */
export const ENTITY_TYPES = {
  EMAIL: 'email',
  PROJECT: 'project',
  TASK: 'task',
  SUBTASK: 'subtask',
  STANDUP: 'standup',
  CONTACT: 'contact',
  CALENDAR_EVENT: 'calendar_event',
  USER_PROFILE: 'user_profile',
  SETTINGS: 'settings',
  PAGE: 'page'
};

/**
 * Action Constants
 */
export const ACTIONS = {
  CREATED: 'created',
  UPDATED: 'updated',
  DELETED: 'deleted',
  VIEWED: 'viewed',
  COMPLETED: 'completed',
  STARTED: 'started',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
  CHANGED: 'changed',
  DISCOVERED: 'discovered'
};

export default useActivityLogger;
