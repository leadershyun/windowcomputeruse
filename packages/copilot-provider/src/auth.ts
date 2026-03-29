import type { DeviceCodeResponse, CopilotCredentials } from './types';

/**
 * CopilotAuth — GitHub Device Flow authentication for GitHub Copilot.
 *
 * ## Flow
 * 1. Call `startDeviceFlow()` → get user_code + verification_uri to show the user
 * 2. User opens the URL and enters the code
 * 3. Call `pollForToken(device_code, interval)` → resolves when approved
 * 4. Exchange GitHub token for Copilot API token via `exchangeForCopilotToken()`
 *
 * ## Current Status: STUB
 * Network calls are not implemented. Replace with real `fetch` calls.
 *
 * ## Required Endpoints (unofficial, same as used by editor extensions)
 * - Device code:  POST https://github.com/login/device/code
 * - Poll token:   POST https://github.com/login/oauth/access_token
 * - Copilot tok:  GET  https://api.github.com/copilot_internal/v2/token
 *
 * ## Client ID
 * Use the GitHub OAuth App client_id for GitHub Copilot CLI / editor integration.
 * This is publicly documented in open-source clients such as github/gh-copilot.
 */
export class CopilotAuth {
  /** GitHub OAuth App client_id used by the Copilot extension */
  private static readonly CLIENT_ID = 'Iv1.b507a08c87ecfe98';
  private static readonly SCOPE = 'read:user';

  /**
   * Step 1: Request a device code from GitHub.
   * Show `verification_uri` + `user_code` to the user.
   */
  async startDeviceFlow(): Promise<DeviceCodeResponse> {
    // STUB — replace with real fetch:
    // const res = await fetch('https://github.com/login/device/code', {
    //   method: 'POST',
    //   headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ client_id: CopilotAuth.CLIENT_ID, scope: CopilotAuth.SCOPE }),
    // });
    // return res.json();
    console.warn('[CopilotAuth][STUB] startDeviceFlow — returning fake response');
    return {
      device_code: 'stub_device_code',
      user_code: 'STUB-CODE',
      verification_uri: 'https://github.com/login/device',
      expires_in: 900,
      interval: 5,
    };
  }

  /**
   * Step 2: Poll until the user approves the device code.
   * Returns the GitHub OAuth access token.
   */
  async pollForToken(deviceCode: string, intervalSeconds: number): Promise<string> {
    // STUB — replace with real polling loop:
    // while (true) {
    //   await sleep(intervalSeconds * 1000);
    //   const res = await fetch('https://github.com/login/oauth/access_token', {
    //     method: 'POST',
    //     headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
    //     body: JSON.stringify({
    //       client_id: CopilotAuth.CLIENT_ID,
    //       device_code: deviceCode,
    //       grant_type: 'urn:ietf:params:oauth:grant-type:device_code',
    //     }),
    //   });
    //   const data = await res.json();
    //   if (data.access_token) return data.access_token;
    //   if (data.error === 'authorization_pending') continue;
    //   throw new Error(data.error_description ?? data.error);
    // }
    console.warn('[CopilotAuth][STUB] pollForToken — returning fake token');
    void deviceCode;
    void intervalSeconds;
    return 'stub_github_token_gho_xxxx';
  }

  /**
   * Step 3: Exchange the GitHub token for a Copilot API token.
   * The Copilot token is short-lived and must be refreshed.
   */
  async exchangeForCopilotToken(githubToken: string): Promise<{ token: string; expiresAt: number }> {
    // STUB — replace with real fetch:
    // const res = await fetch('https://api.github.com/copilot_internal/v2/token', {
    //   headers: {
    //     Authorization: `token ${githubToken}`,
    //     'Editor-Version': 'windowcomputeruse/0.1.0',
    //     'Copilot-Integration-Id': 'vscode-chat',
    //   },
    // });
    // const data = await res.json();
    // return { token: data.token, expiresAt: data.expires_at };
    console.warn('[CopilotAuth][STUB] exchangeForCopilotToken — returning fake copilot token');
    void githubToken;
    return { token: 'stub_copilot_token', expiresAt: Date.now() + 1800_000 };
  }

  /** Fetch the authenticated user's GitHub login */
  async getAuthenticatedUser(githubToken: string): Promise<{ login: string }> {
    // STUB — replace: GET https://api.github.com/user
    void githubToken;
    return { login: 'stub_user' };
  }
}
