import { EmbedBuilder, Events, type ThreadChannel } from "discord.js";
import logger from "~/utils/logger";
import { isChannelExcluded } from "~/utils/channelFilter";

export default {
  name: Events.ThreadCreate,
  async execute(thread: ThreadChannel<boolean>): Promise<void> {
    if (!thread.guild) return;
    if (isChannelExcluded(thread.parentId ?? thread.id)) return;

    const channelId = process.env.CHANNEL_ID;
    if (!channelId) return;
    const logChannel = thread.guild.channels.cache.get(channelId);
    if (!logChannel || !logChannel.isTextBased()) return;

    const embed = new EmbedBuilder()
      .setTitle("Thread Created")
      .setColor(0x5c6bc0)
      .addFields(
        { name: "Thread", value: `<#${thread.id}>`, inline: true },
        {
          name: "Parent",
          value: thread.parent ? `<#${thread.parent.id}>` : "None",
          inline: true,
        },
        {
          name: "Owner",
          value: thread.ownerId ? `<@${thread.ownerId}>` : "Unknown",
          inline: true,
        }
      )
      .setTimestamp();

    await logChannel.send({ embeds: [embed] });
    logger.info(thread.id, "Thread creation logged.");
  },
};
