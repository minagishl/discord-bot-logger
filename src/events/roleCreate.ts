import { EmbedBuilder, Events, type Role } from "discord.js";
import logger from "~/utils/logger";

export default {
  name: Events.GuildRoleCreate,
  async execute(role: Role): Promise<void> {
    const channelId = process.env.CHANNEL_ID;
    if (!channelId || !role.guild) return;
    const logChannel = role.guild.channels.cache.get(channelId);
    if (!logChannel || !logChannel.isTextBased()) return;

    const embed = new EmbedBuilder()
      .setTitle("Role Created")
      .setColor(0x81c784)
      .addFields(
        { name: "Role", value: `${role.name} (<@&${role.id}>)`, inline: false },
        { name: "Color", value: role.hexColor, inline: true },
        { name: "Mentionable", value: String(role.mentionable), inline: true },
        { name: "Hoist", value: String(role.hoist), inline: true }
      )
      .setTimestamp();

    await logChannel.send({ embeds: [embed] });
    logger.info(role.id, "Role creation logged.");
  },
};
