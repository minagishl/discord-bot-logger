import { EmbedBuilder, Events, type User } from "discord.js";
import logger from "~/utils/logger";

export default {
  name: Events.UserUpdate,
  async execute(oldUser: User, newUser: User): Promise<void> {
    const channelId = process.env.CHANNEL_ID;
    if (!channelId) return;
    const guilds = newUser.client.guilds.cache;

    // Notify every guild where the user exists; assumes the same log channel id is used
    for (const [, guild] of guilds) {
      const member = guild.members.cache.get(newUser.id);
      if (!member) continue;

      const logChannel = guild.channels.cache.get(channelId);
      if (!logChannel || !logChannel.isTextBased()) continue;

      const changes: string[] = [];
      if (oldUser.username !== newUser.username) {
        changes.push(
          `Username: **${oldUser.username}** → **${newUser.username}**`
        );
      }
      if (oldUser.globalName !== newUser.globalName) {
        changes.push(
          `Global Name: **${oldUser.globalName ?? "None"}** → **${
            newUser.globalName ?? "None"
          }**`
        );
      }
      if (oldUser.displayAvatarURL() !== newUser.displayAvatarURL()) {
        changes.push("Avatar updated.");
      }

      if (changes.length === 0) continue;

      const embed = new EmbedBuilder()
        .setTitle("User Profile Updated")
        .setColor(0x90caf9)
        .setDescription(changes.join("\n"))
        .addFields({
          name: "User",
          value: `${newUser.tag} (<@${newUser.id}>)`,
        })
        .setTimestamp();

      await logChannel.send({ embeds: [embed] });
      logger.info(newUser.id, "User profile update logged.");
    }
  },
};
