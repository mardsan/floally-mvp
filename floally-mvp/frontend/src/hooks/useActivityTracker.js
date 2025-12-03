/**
 * Enhanced Activity Event Tracker v2.0
 * 
 * Comprehensive event logging system for AI learning and analytics
 * Features:
 * - Automatic batching for performance
 * - Session tracking
 * - Device detection
 * - Offline queue support
 * - Performance monitoring
 * 
 * Usage:
 * ```jsx
 * import { useActivityTracker, EVENT_TYPES } from './hooks/useActivityTracker';
 * 
 * function MyComponent() {
 *   const { track, trackBatch } = useActivityTracker();
 *   
 *   const handleAction = () => {
 *     track(EVENT_TYPES.PROJECT_CREATED, {
 *       entityType: 'project',
 *       entityId: project.id,
 *       metadata: { name: project.name, priority: project.priority }
 *     });
 *   };
 * }
 * ```
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Batch configuration
const BATCH_SIZE = 10; // Send after 10 events
const BATCH_INTERVAL = 5000; // Or send every 5 seconds
const MAX_QUEUE_SIZE = 100; // Max events to queue before forcing send

// Session management
let sessionId = null;
const getSessionId = () => {
  if (!sessionId) {
    sessionId = localStorage.getItem('activity_session_id');
    if (!sessionId) {
      sessionId = uuidv4();
      localStorage.setItem('activity_session_id', sessionId);
    }
  }
  return sessionId;
};

// Device detection
const getDeviceType = () => {
  const width = window.innerWidth;
  if (width < 768) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
};

/**
 * Main Activity Tracker Hook
 */
export function useActivityTracker(userEmail) {
  const eventQueue = useRef([]);
  const batchTimer = useRef(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Flush queue on unmount or page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (eventQueue.current.length > 0) {
        sendBatch(eventQueue.current, userEmail, true); // Synchronous send
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      if (batchTimer.current) {
        clearTimeout(batchTimer.current);
      }
      // Flush remaining events
      if (eventQueue.current.length > 0) {
        sendBatch(eventQueue.current, userEmail);
      }
    };
  }, [userEmail]);

  /**
   * Send batched events to backend
   */
  const sendBatch = useCallback(async (events, email, synchronous = false) => {
    if (!email || events.length === 0) return;

    const payload = {
      events: events.map(event => ({
        event_type: event.event_type,
        entity_type: event.entity_type || null,
        entity_id: event.entity_id || null,
        event_metadata: event.metadata || {},
        session_id: event.session_id,
        device_type: event.device_type,
        user_agent: navigator.userAgent,
        context_snapshot: event.context_snapshot || {},
        ai_suggestion_id: event.ai_suggestion_id || null,
        outcome: event.outcome || 'success',
        duration_ms: event.duration_ms || null,
        event_timestamp: event.event_timestamp
      }))
    };

    try {
      if (synchronous) {
        // Use sendBeacon for guaranteed delivery on page unload
        const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
        navigator.sendBeacon(
          `${API_URL}/api/events/log/batch?user_email=${encodeURIComponent(email)}`,
          blob
        );
      } else {
        await axios.post(
          `${API_URL}/api/events/log/batch`,
          payload,
          { params: { user_email: email } }
        );
      }
      
      console.log(`📊 Sent batch of ${events.length} activity events`);
    } catch (error) {
      console.error('Failed to send activity batch:', error);
      // Re-queue events if online (will retry)
      if (isOnline && !synchronous) {
        eventQueue.current.unshift(...events);
      }
    }
  }, [isOnline]);

  /**
   * Schedule batch send
   */
  const scheduleBatchSend = useCallback(() => {
    if (batchTimer.current) {
      clearTimeout(batchTimer.current);
    }

    batchTimer.current = setTimeout(() => {
      if (eventQueue.current.length > 0) {
        const eventsToSend = [...eventQueue.current];
        eventQueue.current = [];
        sendBatch(eventsToSend, userEmail);
      }
    }, BATCH_INTERVAL);
  }, [sendBatch, userEmail]);

  /**
   * Track a single event (adds to batch queue)
   */
  const track = useCallback((eventType, options = {}) => {
    if (!userEmail) {
      console.warn('Activity tracker: No user email provided');
      return;
    }

    const event = {
      event_type: eventType,
      entity_type: options.entityType || null,
      entity_id: options.entityId || null,
      metadata: options.metadata || {},
      session_id: getSessionId(),
      device_type: getDeviceType(),
      context_snapshot: options.contextSnapshot || {},
      ai_suggestion_id: options.aiSuggestionId || null,
      outcome: options.outcome || 'success',
      duration_ms: options.durationMs || null,
      event_timestamp: new Date().toISOString()
    };

    eventQueue.current.push(event);

    // Send immediately if queue is full or force flag is set
    if (eventQueue.current.length >= BATCH_SIZE || options.immediate) {
      const eventsToSend = [...eventQueue.current];
      eventQueue.current = [];
      if (batchTimer.current) {
        clearTimeout(batchTimer.current);
      }
      sendBatch(eventsToSend, userEmail);
    } else {
      // Otherwise schedule batch send
      scheduleBatchSend();
    }
  }, [userEmail, sendBatch, scheduleBatchSend]);

  /**
   * Track multiple events at once
   */
  const trackBatch = useCallback((events) => {
    events.forEach(event => track(event.type, event.options));
  }, [track]);

  /**
   * Track page view (convenience method)
   */
  const trackPageView = useCallback((pageName, metadata = {}) => {
    track(EVENT_TYPES.PAGE_VIEW, {
      entityType: 'page',
      entityId: pageName,
      metadata: { page_name: pageName, ...metadata }
    });
  }, [track]);

  /**
   * Track timed action (measures duration)
   */
  const trackTimed = useCallback((eventType, options = {}) => {
    const startTime = performance.now();
    
    return {
      complete: (additionalMetadata = {}) => {
        const durationMs = Math.round(performance.now() - startTime);
        track(eventType, {
          ...options,
          durationMs,
          metadata: { ...options.metadata, ...additionalMetadata }
        });
      },
      cancel: () => {
        const durationMs = Math.round(performance.now() - startTime);
        track(eventType, {
          ...options,
          durationMs,
          outcome: 'cancelled',
          metadata: options.metadata
        });
      }
    };
  }, [track]);

  /**
   * Get analytics summary
   */
  const getAnalytics = useCallback(async (days = 30) => {
    if (!userEmail) return null;
    
    try {
      const response = await axios.get(`${API_URL}/api/events/analytics`, {
        params: { user_email: userEmail, days }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to get analytics:', error);
      return null;
    }
  }, [userEmail]);

  /**
   * Get recent events
   */
  const getRecentEvents = useCallback(async (options = {}) => {
    if (!userEmail) return [];
    
    try {
      const response = await axios.get(`${API_URL}/api/events/`, {
        params: {
          user_email: userEmail,
          event_category: options.category,
          event_type: options.eventType,
          entity_id: options.entityId,
          days: options.days || 7,
          limit: options.limit || 50
        }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to get recent events:', error);
      return [];
    }
  }, [userEmail]);

  return {
    track,
    trackBatch,
    trackPageView,
    trackTimed,
    getAnalytics,
    getRecentEvents,
    queueSize: eventQueue.current.length,
    isOnline
  };
}

/**
 * Event Type Constants (matches backend EventTemplate)
 */
export const EVENT_TYPES = {
  // Email events
  EMAIL_OPENED: 'email_opened',
  EMAIL_STARRED: 'email_starred',
  EMAIL_ARCHIVED: 'email_archived',
  EMAIL_DELETED: 'email_deleted',
  EMAIL_REPLIED: 'email_replied',
  EMAIL_CATEGORY_CHANGED: 'email_category_changed',
  EMAIL_FEEDBACK_GIVEN: 'email_feedback_given',
  
  // Project events
  PROJECT_CREATED: 'project_created',
  PROJECT_UPDATED: 'project_updated',
  PROJECT_DELETED: 'project_deleted',
  PROJECT_STATUS_CHANGED: 'project_status_changed',
  PROJECT_OPENED: 'project_opened',
  PROJECT_GOAL_ADDED: 'project_goal_added',
  PROJECT_GOAL_COMPLETED: 'project_goal_completed',
  PROJECT_SUBTASK_COMPLETED: 'project_subtask_completed',
  
  // Calendar events
  CALENDAR_EVENT_CREATED: 'calendar_event_created',
  CALENDAR_EVENT_UPDATED: 'calendar_event_updated',
  CALENDAR_EVENT_DELETED: 'calendar_event_deleted',
  CALENDAR_EVENT_OPENED: 'calendar_event_opened',
  CALENDAR_VIEW_CHANGED: 'calendar_view_changed',
  
  // Standup events
  STANDUP_COMPLETED: 'standup_completed',
  STANDUP_SKIPPED: 'standup_skipped',
  STANDUP_ONE_THING_UPDATED: 'standup_one_thing_updated',
  STANDUP_ONE_THING_COMPLETED: 'standup_one_thing_completed',
  
  // AI interaction events
  AI_SUGGESTION_SHOWN: 'ai_suggestion_shown',
  AI_SUGGESTION_ACCEPTED: 'ai_suggestion_accepted',
  AI_SUGGESTION_REJECTED: 'ai_suggestion_rejected',
  AI_WIZARD_STARTED: 'ai_wizard_started',
  AI_WIZARD_COMPLETED: 'ai_wizard_completed',
  AI_CHAT_MESSAGE_SENT: 'ai_chat_message_sent',
  
  // Navigation events
  PAGE_VIEW: 'page_view',
  MODAL_OPENED: 'modal_opened',
  MODAL_CLOSED: 'modal_closed',
  TAB_CHANGED: 'tab_changed',
  
  // Settings events
  SETTINGS_UPDATED: 'settings_updated',
  PROFILE_UPDATED: 'profile_updated',
  ACCOUNT_CONNECTED: 'account_connected',
  ACCOUNT_DISCONNECTED: 'account_disconnected',
  
  // Search and filter events
  SEARCH_PERFORMED: 'search_performed',
  FILTER_APPLIED: 'filter_applied',
  SORT_CHANGED: 'sort_changed'
};

/**
 * Entity Type Constants
 */
export const ENTITY_TYPES = {
  EMAIL: 'email',
  PROJECT: 'project',
  TASK: 'task',
  SUBTASK: 'subtask',
  GOAL: 'goal',
  STANDUP: 'standup',
  CONTACT: 'contact',
  CALENDAR_EVENT: 'calendar_event',
  USER_PROFILE: 'user_profile',
  SETTINGS: 'settings',
  PAGE: 'page',
  MODAL: 'modal',
  TAB: 'tab'
};

export default useActivityTracker;
