import { Events, type Interaction } from "discord.js";
import dotenv from "dotenv";
import logger from "~/utils/logger";

// Load the environment variables
dotenv.config();

// Map to keep track of user rate limits
const rateLimitMap = new Map();

export default {
  name: Events.InteractionCreate,
  async execute(interaction: Interaction): Promise<void> {
    // Check if the interaction is a chat input command
    if (!interaction.isChatInputCommand()) return;

    // Check if the user has exceeded the rate limit
    const userRateLimit: number = rateLimitMap.get(interaction.user.id);
    // Slash commands that can be executed per second
    const rateLimit = parseInt(process.env.RATE_LIMIT ?? "1");
    if (userRateLimit !== 0 && userRateLimit > rateLimit) {
      await interaction.reply(
        "You are sending too many requests. Please wait a moment and try again."
      );
      logger.warn(interaction.user.id, "command is currently restricted.");
      return;
    }

    // Get the command object from the client's commands collection
    const command = interaction.client.commands.get(interaction.commandName);

    // If the command does not exist, log an error and return
    if (command === undefined) {
      console.error(`The command ${interaction.commandName} does not exist.`);
      return;
    }

    try {
      // Execute the command and log the result
      await command.execute(interaction);
      logger.info(
        interaction.user.id,
        `The ${interaction.commandName} command has been executed.`
      );
    } catch (err: any) {
      // If an error occurs, log the error and send an error message to the user
      console.error(err);
      await interaction.reply("An error occurred while executing the command.");
    }

    // Update the user's rate limit and clear after 5 seconds (no timer leak)
    rateLimitMap.set(interaction.user.id, (userRateLimit ?? 0) + 1);
    setTimeout(() => {
      rateLimitMap.delete(interaction.user.id);
    }, 5000).unref();
  },
};
