import { Events, Message, EmbedBuilder, PartialMessage } from "discord.js";
import logger from "~/utils/logger";
import { isChannelExcluded } from "~/utils/channelFilter";

export default {
  name: Events.MessageUpdate,
  async execute(
    oldMessage: Message | PartialMessage,
    newMessage: Message | PartialMessage
  ): Promise<void> {
    if (!newMessage.guild || newMessage.author?.bot) return;

    // Check if this channel should be excluded from logging
    if (isChannelExcluded(newMessage.channel.id)) return;

    const channelId = process.env.CHANNEL_ID;
    if (!channelId) return;
    const logChannel = newMessage.guild.channels.cache.get(channelId);
    if (!logChannel || !logChannel.isTextBased()) return;

    // Fetch the old message if possible
    let oldContent: string = "Could not retrieve";
    if ("content" in oldMessage && oldMessage.content) {
      oldContent = oldMessage.content;
    } else if (!oldMessage.partial) {
      oldContent = "";
    }

    const newContent = newMessage.content || "";
    // Do nothing if the content has not changed
    if (oldContent.trim() === newContent.trim()) return;

    const embed = new EmbedBuilder()
      .setTitle("Message Edited")
      .setColor(0xffa500)
      .addFields(
        {
          name: "User",
          value: newMessage.author
            ? `${newMessage.author.username ?? "Unknown"} (<@${
                newMessage.author.id
              }>)`
            : "Unknown",
          inline: true,
        },
        { name: "Channel", value: newMessage.channel.toString(), inline: true },
        { name: "Before", value: oldContent.substring(0, 1024) || "なし" },
        { name: "After", value: newContent.substring(0, 1024) || "なし" }
      )
      .setTimestamp();

    await logChannel.send({ embeds: [embed] });
    logger.info(newMessage.author?.id ?? "unknown", "Message update logged.");
  },
};
