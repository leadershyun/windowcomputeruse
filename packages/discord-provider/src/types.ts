export interface DiscordConfig {
  /** Bot token from the Discord Developer Portal */
  botToken: string;
  /** Guild ID to register slash commands (optional; omit for global) */
  guildId?: string;
}

export interface DiscordCommand {
  name: string;
  description: string;
  handler: (interaction: DiscordInteraction) => Promise<void>;
}

/** Simplified interaction interface (mirrors discord.js ChatInputCommandInteraction) */
export interface DiscordInteraction {
  commandName: string;
  options: Map<string, string | number | boolean>;
  reply(content: string): Promise<void>;
  editReply(content: string): Promise<void>;
  followUp(content: string): Promise<void>;
  user: { id: string; username: string };
  channelId: string;
}
