export interface DeviceCodeResponse {
  device_code: string;
  user_code: string;
  verification_uri: string;
  expires_in: number;
  interval: number;
}

export interface CopilotCredentials {
  githubToken: string;
  copilotToken?: string;
  copilotTokenExpiresAt?: number;
  login?: string;
}
