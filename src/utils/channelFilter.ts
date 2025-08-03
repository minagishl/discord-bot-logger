/**
 * Channel filtering utility functions
 */

/**
 * Get excluded channel IDs from environment variable
 * @returns Array of channel IDs to exclude from logging
 */
export const getExcludedChannels = (): string[] => {
  const excludedChannels = process.env.EXCLUDED_CHANNELS;
  if (!excludedChannels) return [];
  
  return excludedChannels
    .split(',')
    .map(id => id.trim())
    .filter(id => id.length > 0);
};

/**
 * Check if a channel should be excluded from logging
 * @param channelId - The channel ID to check
 * @returns true if the channel should be excluded, false otherwise
 */
export const isChannelExcluded = (channelId: string): boolean => {
  const excludedChannels = getExcludedChannels();
  return excludedChannels.includes(channelId);
};