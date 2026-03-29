/// <reference types="vite/client" />

interface Window {
  api: {
    copilot: {
      getStatus(): Promise<{ authenticated: boolean; login?: string }>;
      startAuth(): Promise<{ userCode: string; verificationUri: string }>;
      openVerificationUrl(url: string): Promise<void>;
      waitForAuth(): Promise<{ login?: string }>;
      disconnect(): Promise<void>;
      listModels(): Promise<Array<{ id: string; name: string }>>;
    };
    discord: {
      getStatus(): Promise<{ connected: boolean }>;
      connect(config: { botToken: string; guildId?: string }): Promise<{ connected: boolean }>;
      disconnect(): Promise<void>;
    };
    agent: {
      run(goal: string): Promise<{ taskId: string; status: string }>;
      stop(): Promise<void>;
      captureScreen(): Promise<string>;
      onEvent(callback: (event: unknown) => void): void;
      offEvent(callback: (event: unknown) => void): void;
    };
  };
}
