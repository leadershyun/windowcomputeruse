import type { DiscordConfig, DiscordCommand } from './types';

/**
 * DiscordProvider — manages the user's Discord bot connection.
 *
 * Users supply their own bot token from the Discord Developer Portal.
 * This provider manages the bot lifecycle and slash command routing.
 *
 * ## Built-in Commands (registered on connect)
 * - /run [prompt]    → submit a task to the agent
 * - /status [id]     → get task status
 * - /stop [id]       → stop a running task
 * - /approve [id]    → approve a pending action
 *
 * ## Current Status: STUB
 * Replace the stub implementations with real discord.js code.
 *
 * ## TODO: Production Implementation
 * 1. npm install discord.js in this package
 * 2. Replace _connectStub() with a real Client initialisation
 * 3. Wire up REST slash command registration
 * 4. Connect the on('interactionCreate') handler to the command map
 */
export class DiscordProvider {
  private connected = false;
  private commands = new Map<string, DiscordCommand>();
  private config?: DiscordConfig;

  /** Wire up the task submission callback */
  onRunCommand?: (goal: string, userId: string, channelId: string) => Promise<string>;
  /** Wire up the status query callback */
  onStatusCommand?: (taskId: string) => Promise<string>;

  /**
   * Connect the Discord bot with the given config.
   * Registers built-in slash commands automatically.
   */
  async connect(config: DiscordConfig): Promise<void> {
    this.config = config;

    // Register built-in commands
    this._registerBuiltins();

    // STUB — replace with:
    // const { Client, GatewayIntentBits, REST, Routes } = await import('discord.js');
    // this._client = new Client({ intents: [GatewayIntentBits.Guilds] });
    // await this._registerSlashCommands(rest, config);
    // this._client.on('interactionCreate', this._handleInteraction.bind(this));
    // await this._client.login(config.botToken);
    console.warn('[DiscordProvider][STUB] connect — bot not actually started');
    this.connected = true;
  }

  async disconnect(): Promise<void> {
    // STUB — call this._client?.destroy()
    this.connected = false;
    this.config = undefined;
  }

  isConnected(): boolean {
    return this.connected;
  }

  /** Register a custom slash command */
  registerCommand(cmd: DiscordCommand): void {
    this.commands.set(cmd.name, cmd);
  }

  /** Send a message to a channel (e.g., task updates) */
  async sendMessage(channelId: string, content: string): Promise<void> {
    // STUB — replace with this._client.channels.fetch(channelId).send(content)
    console.warn(`[DiscordProvider][STUB] sendMessage to ${channelId}:`, content);
  }

  private _registerBuiltins(): void {
    this.registerCommand({
      name: 'run',
      description: 'Submit a task to the AI agent',
      handler: async (interaction) => {
        const prompt = interaction.options.get('prompt') as string | undefined;
        if (!prompt) {
          await interaction.reply('Usage: /run prompt:<your task>');
          return;
        }
        await interaction.reply(`✅ Task received: "${prompt}". Starting…`);
        if (this.onRunCommand) {
          const taskId = await this.onRunCommand(prompt, interaction.user.id, interaction.channelId);
          await interaction.editReply(`✅ Task started (ID: \`${taskId}\`)`);
        }
      },
    });

    this.registerCommand({
      name: 'status',
      description: 'Check the status of a task',
      handler: async (interaction) => {
        const id = interaction.options.get('id') as string | undefined;
        if (!id) {
          await interaction.reply('Usage: /status id:<task-id>');
          return;
        }
        const status = this.onStatusCommand ? await this.onStatusCommand(id) : 'Unknown';
        await interaction.reply(`Task \`${id}\` — ${status}`);
      },
    });

    this.registerCommand({
      name: 'stop',
      description: 'Stop a running task',
      handler: async (interaction) => {
        await interaction.reply('⏹️ Stop command received (stub).');
      },
    });

    this.registerCommand({
      name: 'approve',
      description: 'Approve a pending agent action',
      handler: async (interaction) => {
        await interaction.reply('✅ Approval recorded (stub).');
      },
    });
  }
}
