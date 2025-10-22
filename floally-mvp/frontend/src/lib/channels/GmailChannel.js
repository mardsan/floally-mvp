/**
 * Gmail Channel Implementation
 * Implements the BaseChannel interface for Gmail
 */

import { BaseChannel, CHANNEL_TYPES, DataItem } from './channelFramework';

export class GmailChannel extends BaseChannel {
  constructor() {
    super({
      id: 'gmail',
      name: 'Gmail',
      type: CHANNEL_TYPES.EMAIL,
      icon: '📧',
      description: 'Access and manage your email',
      color: '#EA4335',
      requiresOAuth: true,
      scopes: [
        'https://www.googleapis.com/auth/gmail.readonly',
        'https://www.googleapis.com/auth/gmail.modify'
      ]
    });
  }

  async getAuthUrl(userId) {
    return `/api/gmail/auth?userId=${userId}`;
  }

  async getStatus(userId) {
    try {
      const response = await fetch(`/api/gmail/status?userId=${userId}`);
      const data = await response.json();
      return {
        connected: data.connected && data.hasGmail,
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
        maxResults: filters.maxResults || 50,
        ...filters
      });

      const response = await fetch(`/api/gmail/messages?${params}`);
      const data = await response.json();
      
      return data.messages.map(msg => this.normalizeData(msg));
    } catch (error) {
      console.error('Error fetching Gmail data:', error);
      return [];
    }
  }

  normalizeData(rawMessage) {
    return new DataItem({
      id: rawMessage.id,
      channelId: 'gmail',
      type: 'email',
      title: rawMessage.subject,
      content: rawMessage.snippet,
      timestamp: rawMessage.timestamp,
      from: rawMessage.from,
      to: rawMessage.to,
      url: `https://mail.google.com/mail/u/0/#inbox/${rawMessage.id}`,
      priority: rawMessage.isImportant ? 'high' : 'medium',
      status: rawMessage.isUnread ? 'unread' : 'read',
      metadata: {
        labels: rawMessage.labels,
        hasAttachments: rawMessage.hasAttachments,
        threadId: rawMessage.threadId
      },
      projects: [], // Will be filled by project matcher
      tags: this.extractTags(rawMessage)
    });
  }

  extractTags(message) {
    const tags = [];
    
    // Add label-based tags
    if (message.labels) {
      if (message.labels.includes('IMPORTANT')) tags.push('important');
      if (message.labels.includes('STARRED')) tags.push('starred');
    }
    
    // Add attachment tag
    if (message.hasAttachments) tags.push('has-attachment');
    
    return tags;
  }

  getActions() {
    return [
      {
        id: 'mark_read',
        name: 'Mark as Read',
        icon: '✓',
        description: 'Mark selected emails as read'
      },
      {
        id: 'archive',
        name: 'Archive',
        icon: '📦',
        description: 'Archive selected emails'
      },
      {
        id: 'star',
        name: 'Star',
        icon: '⭐',
        description: 'Star selected emails'
      }
    ];
  }
}
