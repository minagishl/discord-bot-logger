import { EmbedBuilder, Events, type Invite } from "discord.js";
import logger from "~/utils/logger";

export default {
  name: Events.InviteDelete,
  async execute(invite: Invite): Promise<void> {
    if (!invite.guild || !("channels" in invite.guild)) return;

    const channelId = process.env.CHANNEL_ID;
    if (!channelId) return;
    const logChannel = invite.guild.channels.cache.get(channelId);
    if (!logChannel || !logChannel.isTextBased()) return;

    const embed = new EmbedBuilder()
      .setTitle("Invite Deleted")
      .setColor(0xe57373)
      .addFields(
        { name: "Code", value: invite.code, inline: true },
        {
          name: "Channel",
          value: invite.channel ? `<#${invite.channel.id}>` : "Unknown",
          inline: true,
        },
        {
          name: "Inviter",
          value: invite.inviter
            ? `${invite.inviter.tag} (<@${invite.inviter.id}>)`
            : "Unknown",
          inline: false,
        }
      )
      .setTimestamp();

    await logChannel.send({ embeds: [embed] });
    logger.info(invite.code, "Invite deletion logged.");
  },
};
