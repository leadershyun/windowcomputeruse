import type { AgentAction } from './action';
import type { SessionState } from './session';

/** Interface that the Windows runtime must implement */
export interface WindowsRuntime {
  /** Capture a PNG screenshot; returns base64-encoded PNG */
  captureScreen(): Promise<string>;
  /** Execute an agent action */
  executeAction(action: AgentAction): Promise<{ success: boolean; error?: string }>;
  /** Get current session metadata */
  getSessionState(): Promise<SessionState>;
  /** Start continuous capture loop */
  startCapture(intervalMs: number): void;
  /** Stop capture loop */
  stopCapture(): void;
}
