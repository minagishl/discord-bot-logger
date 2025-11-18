import {
  EmbedBuilder,
  Events,
  type MessageReaction,
  type User,
} from "discord.js";
import logger from "~/utils/logger";
import { isChannelExcluded } from "~/utils/channelFilter";

export default {
  name: Events.MessageReactionRemove,
  async execute(reaction: MessageReaction, user: User): Promise<void> {
    try {
      if (reaction.partial) {
        reaction = await reaction.fetch();
      }
    } catch (error) {
      logger.error(user.id, `Failed to fetch partial reaction: ${error}`);
      return;
    }

    const message = reaction.message;
    if (!message.guild) return;
    if (user.bot) return;
    if (isChannelExcluded(message.channelId)) return;

    const channelId = process.env.CHANNEL_ID;
    if (!channelId) return;
    const logChannel = message.guild.channels.cache.get(channelId);
    if (!logChannel || !logChannel.isTextBased()) return;

    const emojiUrl = reaction.emoji.imageURL();
    const embed = new EmbedBuilder()
      .setTitle("Reaction Removed")
      .setColor(0xd32f2f)
      .addFields(
        { name: "User", value: `${user.tag} (<@${user.id}>)`, inline: false },
        {
          name: "Emoji",
          value:
            (emojiUrl &&
              `[${reaction.emoji.name ?? "External Emoji"}](${emojiUrl})`) ||
            reaction.emoji.toString() ||
            reaction.emoji.name ||
            "Unknown",
          inline: true,
        },
        { name: "Channel", value: `<#${message.channelId}>`, inline: true },
        { name: "Message", value: `[Jump](${message.url})`, inline: false }
      )
      .setTimestamp();

    if (emojiUrl) {
      embed.setThumbnail(emojiUrl);
    }

    await logChannel.send({ embeds: [embed] });
    logger.info(user.id, "Reaction removal logged.");
  },
};
