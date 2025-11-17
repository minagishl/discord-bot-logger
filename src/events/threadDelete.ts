import { EmbedBuilder, Events, type ThreadChannel } from "discord.js";
import logger from "~/utils/logger";

export default {
  name: Events.ThreadDelete,
  async execute(thread: ThreadChannel): Promise<void> {
    if (!thread.guild) return;

    const channelId = process.env.CHANNEL_ID;
    if (!channelId) return;
    const logChannel = thread.guild.channels.cache.get(channelId);
    if (!logChannel || !logChannel.isTextBased()) return;

    const embed = new EmbedBuilder()
      .setTitle("Thread Deleted")
      .setColor(0xc62828)
      .addFields(
        { name: "Thread", value: thread.name, inline: false },
        { name: "Thread ID", value: thread.id, inline: true },
        {
          name: "Parent",
          value: thread.parent ? `<#${thread.parent.id}>` : "None",
          inline: true,
        }
      )
      .setTimestamp();

    await logChannel.send({ embeds: [embed] });
    logger.info(thread.id, "Thread deletion logged.");
  },
};
