/** Supported model providers */
export type ProviderType = 'github-copilot' | 'openai' | 'anthropic';

/** Auth state for a provider */
export type ProviderAuthStatus = 'disconnected' | 'pending' | 'connected' | 'error';

/** Stored connection config for a provider */
export interface ProviderConnection {
  type: ProviderType;
  status: ProviderAuthStatus;
  displayName?: string;
  /** ISO date string when connection was last validated */
  connectedAt?: string;
  error?: string;
}

/** Abstraction for calling an AI model */
export interface ModelProvider {
  readonly type: ProviderType;
  /** Human-readable name */
  readonly name: string;
  /** Check whether credentials are present and valid */
  isAuthenticated(): Promise<boolean>;
  /** Start auth flow (device flow, OAuth, etc.) */
  authenticate(): Promise<void>;
  /** Disconnect / revoke credentials */
  disconnect(): Promise<void>;
  /** List available models */
  listModels(): Promise<ModelInfo[]>;
  /** Core: given observation produce next action */
  generateAction(input: AgentInput): Promise<AgentOutput>;
}

export interface ModelInfo {
  id: string;
  name: string;
  maxTokens?: number;
}

export interface AgentInput {
  goal: string;
  screenshotBase64: string;
  history: Array<{ observation: string; action: string }>;
  systemPrompt?: string;
}

export interface AgentOutput {
  reasoning?: string;
  action: import('./action').AgentAction;
}
