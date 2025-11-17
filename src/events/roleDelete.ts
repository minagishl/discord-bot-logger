import { EmbedBuilder, Events, type Role } from "discord.js";
import logger from "~/utils/logger";

export default {
  name: Events.GuildRoleDelete,
  async execute(role: Role): Promise<void> {
    const channelId = process.env.CHANNEL_ID;
    if (!channelId || !role.guild) return;
    const logChannel = role.guild.channels.cache.get(channelId);
    if (!logChannel || !logChannel.isTextBased()) return;

    const embed = new EmbedBuilder()
      .setTitle("Role Deleted")
      .setColor(0xe53935)
      .addFields({
        name: "Role",
        value: `${role.name} (${role.id})`,
        inline: false,
      })
      .setTimestamp();

    await logChannel.send({ embeds: [embed] });
    logger.info(role.id, "Role deletion logged.");
  },
};
