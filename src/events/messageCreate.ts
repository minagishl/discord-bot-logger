import { EmbedBuilder, Events, type Message } from "discord.js";
import logger from "~/utils/logger";
import { isChannelExcluded } from "~/utils/channelFilter";

export default {
  name: Events.MessageCreate,
  async execute(message: Message): Promise<void> {
    if (!message.guild) return;

    // Ignore bots and excluded channels
    if (message.author?.bot) return;
    if (isChannelExcluded(message.channel.id)) return;

    const channelId = process.env.CHANNEL_ID;
    if (!channelId) return;
    const logChannel = message.guild.channels.cache.get(channelId);
    if (!logChannel || !logChannel.isTextBased()) return;

    // Ensure full message content is available when partials are enabled
    if (message.partial) {
      try {
        await message.fetch();
      } catch (error) {
        logger.error(message.id, `Failed to fetch partial message: ${error}`);
        return;
      }
    }

    const attachments = [...message.attachments.values()];
    const attachmentsInfo =
      attachments.length > 0
        ? attachments
            .map((file, idx) => {
              const sizeKb = file.size
                ? `${Math.round(file.size / 1024)}KB`
                : "";
              return `${idx + 1}. ${file.name ?? "file"} ${sizeKb} [link](${
                file.url
              })`;
            })
            .join("\n")
            .slice(0, 1024)
        : "None";

    const embed = new EmbedBuilder()
      .setTitle("Message Created")
      .setColor(0x4caf50)
      .addFields(
        {
          name: "User",
          value: `${
            message.author?.tag ?? message.author?.username ?? "Unknown"
          } (<@${message.author?.id}>)`,
          inline: false,
        },
        { name: "Channel", value: `<#${message.channel.id}>`, inline: true },
        { name: "Message ID", value: message.id, inline: true },
        {
          name: "Content",
          value: message.content?.slice(0, 1024) || "なし",
        },
        { name: "Attachments", value: attachmentsInfo }
      )
      .setTimestamp(message.createdAt)
      .setURL(message.url);

    await logChannel.send({ embeds: [embed] });
    logger.info(message.author?.id ?? "unknown", "Message creation logged.");
  },
};
