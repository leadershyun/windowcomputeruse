import type {
  ModelProvider,
  ModelInfo,
  AgentInput,
  AgentOutput,
  ProviderType,
} from '@windowcomputeruse/shared';
import { CopilotAuth } from './auth';
import type { CopilotCredentials } from './types';

/**
 * GitHubCopilotProvider — ModelProvider implementation for GitHub Copilot.
 *
 * Authentication uses the GitHub Device Flow (no API key required).
 * Users log in with their own GitHub account.
 *
 * ## Current Status: STUB
 * generateAction() returns a dummy action until real Copilot API calls
 * are implemented. The auth flow is also stubbed.
 *
 * ## TODO: Production Implementation
 * - Wire CopilotAuth.startDeviceFlow / pollForToken properly
 * - Store credentials securely (use electron-store or OS keychain)
 * - Implement generateAction() using the Copilot Chat API
 *   (POST https://api.githubcopilot.com/chat/completions with vision support)
 * - Handle token refresh (copilot tokens expire ~30 min)
 */
export class GitHubCopilotProvider implements ModelProvider {
  readonly type: ProviderType = 'github-copilot';
  readonly name = 'GitHub Copilot';

  private credentials: CopilotCredentials | null = null;
  private auth = new CopilotAuth();

  /** Inject stored credentials on startup */
  setCredentials(creds: CopilotCredentials): void {
    this.credentials = creds;
  }

  /** Get current credentials (for persistence) */
  getCredentials(): CopilotCredentials | null {
    return this.credentials;
  }

  async isAuthenticated(): Promise<boolean> {
    return this.credentials?.githubToken != null;
  }

  /**
   * Start the GitHub Device Flow.
   * Returns the user_code and verification_uri to display to the user.
   * Call waitForAuth() to complete authentication.
   */
  async startAuthFlow(): Promise<{ userCode: string; verificationUri: string }> {
    const resp = await this.auth.startDeviceFlow();
    // Store device_code for polling
    this._pendingDeviceCode = resp.device_code;
    this._pendingInterval = resp.interval;
    return { userCode: resp.user_code, verificationUri: resp.verification_uri };
  }

  private _pendingDeviceCode?: string;
  private _pendingInterval?: number;

  /**
   * Wait for the user to approve the device flow, then complete authentication.
   * Call after startAuthFlow().
   */
  async waitForAuth(): Promise<void> {
    if (!this._pendingDeviceCode) throw new Error('Call startAuthFlow() first.');
    const githubToken = await this.auth.pollForToken(this._pendingDeviceCode, this._pendingInterval ?? 5);
    const { token: copilotToken, expiresAt } = await this.auth.exchangeForCopilotToken(githubToken);
    const { login } = await this.auth.getAuthenticatedUser(githubToken);
    this.credentials = { githubToken, copilotToken, copilotTokenExpiresAt: expiresAt, login };
    this._pendingDeviceCode = undefined;
    this._pendingInterval = undefined;
  }

  /** ModelProvider.authenticate() — alias for the two-step flow for CLI usage */
  async authenticate(): Promise<void> {
    const { userCode, verificationUri } = await this.startAuthFlow();
    console.log(`\nVisit: ${verificationUri}\nEnter code: ${userCode}\n`);
    await this.waitForAuth();
  }

  async disconnect(): Promise<void> {
    this.credentials = null;
  }

  async listModels(): Promise<ModelInfo[]> {
    // STUB — real implementation should GET /models from Copilot API
    return [
      { id: 'gpt-4o', name: 'GPT-4o (via Copilot)' },
      { id: 'gpt-4.1', name: 'GPT-4.1 (via Copilot)' },
      { id: 'claude-sonnet-4', name: 'Claude Sonnet 4 (via Copilot)' },
    ];
  }

  async generateAction(input: AgentInput): Promise<AgentOutput> {
    if (!(await this.isAuthenticated())) {
      throw new Error('Not authenticated. Call authenticate() first.');
    }

    // STUB — replace with real Copilot Chat API call:
    // POST https://api.githubcopilot.com/chat/completions
    // Headers: Authorization: Bearer <copilot_token>
    //          Copilot-Integration-Id: vscode-chat
    //          Editor-Version: windowcomputeruse/0.1.0
    // Body: { model: 'gpt-4o', messages: [...], ... }
    console.warn('[CopilotProvider][STUB] generateAction — returning stub screenshot action');
    void input;

    return {
      reasoning: 'STUB: Take a screenshot to observe the current state.',
      action: { type: 'screenshot', reason: 'Initial observation (stub)' },
    };
  }
}
