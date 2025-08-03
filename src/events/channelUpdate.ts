import {
  Events,
  GuildChannel,
  EmbedBuilder,
  ChannelType,
  TextChannel,
} from "discord.js";
import logger from "~/utils/logger";
import { isChannelExcluded } from "~/utils/channelFilter";

export default {
  name: Events.ChannelUpdate,
  async execute(
    oldChannel: GuildChannel,
    newChannel: GuildChannel
  ): Promise<void> {
    // Check if this channel should be excluded from logging
    if (isChannelExcluded(newChannel.id)) return;

    const channelId = process.env.CHANNEL_ID;
    if (!channelId) return;
    const logChannel = newChannel.client.channels.cache.get(
      channelId
    ) as TextChannel;
    if (!logChannel) return;

    let details = "";
    const changes: string[] = [];

    // Check for name changes
    if (oldChannel.name !== newChannel.name) {
      changes.push(`・Name: **${oldChannel.name}** → **${newChannel.name}**`);
    }

    // Check for type changes
    if (oldChannel.type !== newChannel.type) {
      changes.push(
        `・Type: **${ChannelType[oldChannel.type]}** → **${
          ChannelType[newChannel.type]
        }**`
      );
    }

    // Check for position changes if available
    if ("position" in oldChannel && "position" in newChannel) {
      if (oldChannel.position !== newChannel.position) {
        changes.push(
          `・Position: **${oldChannel.position}** → **${newChannel.position}**`
        );
      }
    }

    // Check for parent category changes
    if ("parent" in oldChannel && "parent" in newChannel) {
      const oldParentName = oldChannel.parent?.name ?? "None";
      const newParentName = newChannel.parent?.name ?? "None";
      if (oldParentName !== newParentName) {
        changes.push(`・Category: **${oldParentName}** → **${newParentName}**`);
      }
    }

    // If no changes were detected, don't send a log
    if (changes.length === 0) return;

    details = changes.join("\n");

    const embed = new EmbedBuilder()
      .setTitle("Channel Updated")
      .setColor(0xffff00)
      .setDescription(details)
      .setTimestamp();

    await logChannel.send({ embeds: [embed] });
    logger.info(newChannel.id, "Channel update logged.");
  },
};
