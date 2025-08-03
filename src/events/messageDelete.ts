import {
  AttachmentBuilder,
  EmbedBuilder,
  Events,
  type Message,
} from "discord.js";
import { get } from "https";
import logger from "~/utils/logger";
import { isChannelExcluded } from "~/utils/channelFilter";

export default {
  name: Events.MessageDelete,
  async execute(message: Message): Promise<void> {
    if (!message.guild) return;

    // If the sender is a bot, the process is aborted.
    if (message.author?.bot) return;

    // Check if this channel should be excluded from logging
    if (isChannelExcluded(message.channel.id)) return;

    const channelId = process.env.CHANNEL_ID;
    if (!channelId) return;
    const logChannel = message.guild.channels.cache.get(channelId);
    if (!logChannel || !logChannel.isTextBased()) return;

    const content = message.content || "None";

    // Extract only images from attachments (if contentType is available or determine by extension)
    const fileAttachments = [...message.attachments.values()];
    // Download and prepare files
    const fileDataArray: { buffer: Buffer; filename: string }[] = [];
    for (const attachment of fileAttachments) {
      try {
        const fileBuffer = await new Promise<Buffer>((resolve, reject) => {
          get(attachment.url, (res) => {
            const chunks: Buffer[] = [];
            res.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
            res.on("end", () => resolve(Buffer.concat(chunks)));
            res.on("error", reject);
          }).on("error", reject);
        });

        const filename =
          attachment.name ||
          "file." + (attachment.contentType?.split("/")[1] || "bin");

        // Store the image data for later upload
        fileDataArray.push({ buffer: fileBuffer, filename });
      } catch (error: unknown) {
        logger.error(
          "Failed to download image:",
          error instanceof Error ? error.message : String(error)
        );
      }
    }

    const hasFiles = fileDataArray.length > 0;
    const attachmentsInfo = hasFiles ? "Files in thread." : "None";
    const description = `**Message:** ${content}\n**Attachments:** ${attachmentsInfo}`;

    const embeds = [];
    const mainEmbed = new EmbedBuilder()
      .setTitle("Message Deleted")
      .setColor(0xff0000)
      .setDescription(description)
      .addFields(
        {
          name: "User",
          value: `${message.author.username ?? "Unknown"} (<@${
            message.author.id
          }>)`,
          inline: true,
        },
        { name: "Channel", value: `<#${message.channel.id}>`, inline: true }
      )
      .setTimestamp();

    embeds.push(mainEmbed);

    const mainMessage = await logChannel.send({ embeds: [mainEmbed] });

    // If there are files, create a thread and upload them there
    if (hasFiles) {
      const thread = await mainMessage.startThread({
        name: "Deleted Message Images",
      });

      // Upload all images to the thread
      for (const { buffer, filename } of fileDataArray) {
        const attachmentBuilder = new AttachmentBuilder(buffer, {
          name: filename,
        });
        await thread.send({ files: [attachmentBuilder] });
      }
    }
    logger.info(message.author?.id, "The message has been deleted.");
  },
};
