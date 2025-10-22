/**
 * Channel Registry Initialization
 * Registers all available channels
 */

import { channelRegistry } from './channelFramework';
import { GmailChannel } from './channels/GmailChannel';
import { GoogleCalendarChannel } from './channels/GoogleCalendarChannel';

// Register all channels
channelRegistry.register(new GmailChannel());
channelRegistry.register(new GoogleCalendarChannel());

// Export configured registry
export { channelRegistry };
export { CHANNEL_TYPES, CHANNEL_STATUS } from './channelFramework';
