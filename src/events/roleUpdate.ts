import { EmbedBuilder, Events, type Role } from "discord.js";
import logger from "~/utils/logger";

const diffPermissions = (oldRole: Role, newRole: Role) => {
  const added = newRole.permissions
    .toArray()
    .filter((p) => !oldRole.permissions.has(p));
  const removed = oldRole.permissions
    .toArray()
    .filter((p) => !newRole.permissions.has(p));
  return { added, removed };
};

export default {
  name: Events.GuildRoleUpdate,
  async execute(oldRole: Role, newRole: Role): Promise<void> {
    const channelId = process.env.CHANNEL_ID;
    if (!channelId || !newRole.guild) return;
    const logChannel = newRole.guild.channels.cache.get(channelId);
    if (!logChannel || !logChannel.isTextBased()) return;

    const changes: string[] = [];
    if (oldRole.name !== newRole.name) {
      changes.push(`Name: **${oldRole.name}** → **${newRole.name}**`);
    }
    if (oldRole.hexColor !== newRole.hexColor) {
      changes.push(`Color: **${oldRole.hexColor}** → **${newRole.hexColor}**`);
    }
    if (oldRole.position !== newRole.position) {
      changes.push(
        `Position: **${oldRole.position}** → **${newRole.position}**`
      );
    }
    if (oldRole.mentionable !== newRole.mentionable) {
      changes.push(
        `Mentionable: **${oldRole.mentionable}** → **${newRole.mentionable}**`
      );
    }
    if (oldRole.hoist !== newRole.hoist) {
      changes.push(`Hoist: **${oldRole.hoist}** → **${newRole.hoist}**`);
    }

    const perms = diffPermissions(oldRole, newRole);
    if (perms.added.length > 0) {
      changes.push(`Permissions Added: ${perms.added.join(", ")}`);
    }
    if (perms.removed.length > 0) {
      changes.push(`Permissions Removed: ${perms.removed.join(", ")}`);
    }

    if (changes.length === 0) return;

    const embed = new EmbedBuilder()
      .setTitle("Role Updated")
      .setColor(0xffc107)
      .setDescription(changes.join("\n"))
      .addFields({
        name: "Role",
        value: `${newRole.name} (<@&${newRole.id}>)`,
        inline: false,
      })
      .setTimestamp();

    await logChannel.send({ embeds: [embed] });
    logger.info(newRole.id, "Role update logged.");
  },
};
