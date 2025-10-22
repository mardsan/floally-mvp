/**
 * Channel Integration Framework
 * 
 * Provides a standardized interface for integrating external services/channels
 * Each channel (Slack, Teams, GitHub, etc.) implements this interface
 */

// Channel types
export const CHANNEL_TYPES = {
  EMAIL: 'email',
  CALENDAR: 'calendar',
  CHAT: 'chat',
  PROJECT_MANAGEMENT: 'project_management',
  FILE_STORAGE: 'file_storage',
  DEVELOPMENT: 'development',
  CRM: 'crm',
  SUPPORT: 'support',
  VIDEO: 'video',
  TIME_TRACKING: 'time_tracking'
};

// Channel status
export const CHANNEL_STATUS = {
  NOT_CONNECTED: 'not_connected',
  CONNECTING: 'connecting',
  CONNECTED: 'connected',
  ERROR: 'error',
  EXPIRED: 'expired'
};

/**
 * Base Channel Interface
 * All channels must implement these methods
 */
export class BaseChannel {
  constructor(config) {
    this.id = config.id;                    // Unique channel ID (e.g., 'slack', 'gmail')
    this.name = config.name;                // Display name (e.g., 'Slack', 'Gmail')
    this.type = config.type;                // Channel type from CHANNEL_TYPES
    this.icon = config.icon;                // Emoji or icon URL
    this.description = config.description;  // Short description
    this.color = config.color;              // Brand color (hex)
    this.requiresOAuth = config.requiresOAuth || false;
    this.scopes = config.scopes || [];      // Required OAuth scopes
  }

  /**
   * Initiate OAuth flow
   * @param {string} userId - User ID
   * @returns {string} Authorization URL
   */
  async getAuthUrl(userId) {
    throw new Error('getAuthUrl must be implemented by channel');
  }

  /**
   * Handle OAuth callback
   * @param {string} code - Authorization code
   * @param {string} userId - User ID
   * @returns {object} Token data
   */
  async handleCallback(code, userId) {
    throw new Error('handleCallback must be implemented by channel');
  }

  /**
   * Check connection status
   * @param {string} userId - User ID
   * @returns {object} { connected: boolean, data: object }
   */
  async getStatus(userId) {
    throw new Error('getStatus must be implemented by channel');
  }

  /**
   * Fetch data from channel
   * @param {string} userId - User ID
   * @param {object} filters - Filter criteria (timeframe, project keywords, etc.)
   * @returns {array} Array of normalized data items
   */
  async fetchData(userId, filters = {}) {
    throw new Error('fetchData must be implemented by channel');
  }

  /**
   * Normalize channel data to standard format
   * @param {object} rawData - Raw data from channel API
   * @returns {object} Normalized data
   */
  normalizeData(rawData) {
    throw new Error('normalizeData must be implemented by channel');
  }

  /**
   * Refresh access token if needed
   * @param {string} userId - User ID
   * @returns {string} New access token
   */
  async refreshToken(userId) {
    throw new Error('refreshToken must be implemented by channel');
  }

  /**
   * Disconnect channel
   * @param {string} userId - User ID
   */
  async disconnect(userId) {
    throw new Error('disconnect must be implemented by channel');
  }

  /**
   * Get channel-specific actions
   * @returns {array} Array of action objects
   */
  getActions() {
    return [];
  }
}

/**
 * Normalized Data Item Structure
 * All channels return data in this format
 */
export class DataItem {
  constructor(data) {
    this.id = data.id;                      // Unique item ID
    this.channelId = data.channelId;        // Source channel ID
    this.type = data.type;                  // Item type (message, event, task, etc.)
    this.title = data.title;                // Item title/subject
    this.content = data.content;            // Item body/description
    this.timestamp = data.timestamp;        // ISO 8601 timestamp
    this.from = data.from;                  // Sender/author
    this.to = data.to;                      // Recipients (array)
    this.url = data.url;                    // Link to original item
    this.priority = data.priority;          // low, medium, high, urgent
    this.status = data.status;              // read, unread, completed, etc.
    this.metadata = data.metadata || {};    // Channel-specific metadata
    this.projects = data.projects || [];    // Matched project IDs
    this.tags = data.tags || [];            // Auto-generated tags
  }
}

/**
 * Channel Registry
 * Manages all registered channels
 */
export class ChannelRegistry {
  constructor() {
    this.channels = new Map();
  }

  register(channel) {
    if (!(channel instanceof BaseChannel)) {
      throw new Error('Channel must extend BaseChannel');
    }
    this.channels.set(channel.id, channel);
  }

  get(channelId) {
    return this.channels.get(channelId);
  }

  getAll() {
    return Array.from(this.channels.values());
  }

  getByType(type) {
    return this.getAll().filter(channel => channel.type === type);
  }

  async getStatuses(userId) {
    const statuses = {};
    for (const [id, channel] of this.channels) {
      try {
        statuses[id] = await channel.getStatus(userId);
      } catch (error) {
        statuses[id] = { connected: false, error: error.message };
      }
    }
    return statuses;
  }
}

// Export singleton instance
export const channelRegistry = new ChannelRegistry();
