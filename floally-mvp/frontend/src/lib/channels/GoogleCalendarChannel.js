/**
 * Google Calendar Channel Implementation
 * Implements the BaseChannel interface for Google Calendar
 */

import { BaseChannel, CHANNEL_TYPES, DataItem } from './channelFramework';

export class GoogleCalendarChannel extends BaseChannel {
  constructor() {
    super({
      id: 'google_calendar',
      name: 'Google Calendar',
      type: CHANNEL_TYPES.CALENDAR,
      icon: '📅',
      description: 'Access your calendar events and meetings',
      color: '#4285F4',
      requiresOAuth: true,
      scopes: [
        'https://www.googleapis.com/auth/calendar.readonly',
        'https://www.googleapis.com/auth/calendar.events'
      ]
    });
  }

  async getAuthUrl(userId) {
    return `/api/calendar/auth?userId=${userId}`;
  }

  async getStatus(userId) {
    try {
      const response = await fetch(`/api/calendar/status?userId=${userId}`);
      const data = await response.json();
      return {
        connected: data.connected && data.hasCalendar,
        email: data.email,
        connectedAt: data.connectedAt
      };
    } catch (error) {
      return { connected: false, error: error.message };
    }
  }

  async fetchData(userId, filters = {}) {
    try {
      const params = new URLSearchParams({
        userId,
        timeMin: filters.timeMin || new Date().toISOString(),
        timeMax: filters.timeMax,
        maxResults: filters.maxResults || 100
      });

      const response = await fetch(`/api/calendar/events?${params}`);
      const data = await response.json();
      
      return data.events.map(event => this.normalizeData(event));
    } catch (error) {
      console.error('Error fetching Calendar data:', error);
      return [];
    }
  }

  normalizeData(rawEvent) {
    const startTime = rawEvent.start?.dateTime || rawEvent.start?.date;
    const endTime = rawEvent.end?.dateTime || rawEvent.end?.date;
    
    return new DataItem({
      id: rawEvent.id,
      channelId: 'google_calendar',
      type: 'meeting',
      title: rawEvent.summary || '(No title)',
      content: rawEvent.description || '',
      timestamp: new Date(startTime).getTime(),
      from: rawEvent.organizer?.email,
      to: rawEvent.attendees?.map(a => a.email) || [],
      url: rawEvent.htmlLink,
      priority: this.determinePriority(rawEvent),
      status: this.determineStatus(rawEvent),
      metadata: {
        location: rawEvent.location,
        startTime,
        endTime,
        duration: this.calculateDuration(startTime, endTime),
        attendees: rawEvent.attendees?.map(a => ({
          email: a.email,
          status: a.responseStatus,
          optional: a.optional
        })),
        conferenceData: rawEvent.conferenceData,
        meetLink: rawEvent.hangoutLink
      },
      projects: [],
      tags: this.extractTags(rawEvent)
    });
  }

  determinePriority(event) {
    // High priority if:
    // - Many attendees (>5)
    // - Has "urgent", "critical", "important" in title
    // - Organizer is not the user (external meeting)
    if (event.summary) {
      const urgentKeywords = ['urgent', 'critical', 'important', 'asap'];
      if (urgentKeywords.some(k => event.summary.toLowerCase().includes(k))) {
        return 'high';
      }
    }
    
    if (event.attendees && event.attendees.length > 5) {
      return 'high';
    }
    
    return 'medium';
  }

  determineStatus(event) {
    const now = Date.now();
    const startTime = new Date(event.start?.dateTime || event.start?.date).getTime();
    const endTime = new Date(event.end?.dateTime || event.end?.date).getTime();
    
    if (endTime < now) return 'completed';
    if (startTime <= now && now <= endTime) return 'in_progress';
    if (startTime - now < 15 * 60 * 1000) return 'upcoming'; // Within 15 min
    return 'scheduled';
  }

  calculateDuration(start, end) {
    const startMs = new Date(start).getTime();
    const endMs = new Date(end).getTime();
    const minutes = Math.round((endMs - startMs) / (1000 * 60));
    
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  }

  extractTags(event) {
    const tags = [];
    
    // Add meeting type tags
    if (event.conferenceData || event.hangoutLink) {
      tags.push('virtual-meeting');
    }
    if (event.location && !event.hangoutLink) {
      tags.push('in-person');
    }
    
    // Add attendee tags
    if (event.attendees) {
      if (event.attendees.length > 5) tags.push('large-meeting');
      if (event.attendees.length === 1) tags.push('1-on-1');
    }
    
    // Add recurring tag
    if (event.recurringEventId) {
      tags.push('recurring');
    }
    
    return tags;
  }

  getActions() {
    return [
      {
        id: 'join_meeting',
        name: 'Join Meeting',
        icon: '🎥',
        description: 'Join virtual meeting'
      },
      {
        id: 'view_details',
        name: 'View Details',
        icon: 'ℹ️',
        description: 'Open in Google Calendar'
      },
      {
        id: 'prepare',
        name: 'Prepare',
        icon: '📝',
        description: 'Get AI meeting prep'
      }
    ];
  }
}
