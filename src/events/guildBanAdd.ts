import { AuditLogEvent, EmbedBuilder, Events, type GuildBan } from "discord.js";
import logger from "~/utils/logger";

export default {
  name: Events.GuildBanAdd,
  async execute(ban: GuildBan): Promise<void> {
    const channelId = process.env.CHANNEL_ID;
    if (!channelId || !ban.guild) return;
    const logChannel = ban.guild.channels.cache.get(channelId);
    if (!logChannel || !logChannel.isTextBased()) return;

    let executor = "Unknown";
    try {
      const logs = await ban.guild.fetchAuditLogs({
        limit: 1,
        type: AuditLogEvent.MemberBanAdd,
      });
      const entry = logs.entries.first();
      if (entry && entry.target?.id === ban.user.id && entry.executor) {
        executor = `${entry.executor.tag} (<@${entry.executor.id}>)`;
      }
    } catch (error) {
      logger.warn(ban.user.id, `Failed to fetch ban executor: ${error}`);
    }

    const embed = new EmbedBuilder()
      .setTitle("User Banned")
      .setColor(0x000000)
      .addFields(
        {
          name: "User",
          value: `${ban.user.tag} (<@${ban.user.id}>)`,
          inline: false,
        },
        { name: "Executor", value: executor, inline: false },
        {
          name: "Reason",
          value: ban.reason || "No reason provided",
          inline: false,
        }
      )
      .setTimestamp();

    await logChannel.send({ embeds: [embed] });
    logger.info(ban.user.id, "Guild ban logged.");
  },
};
