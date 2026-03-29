import type { ModelProvider, SessionState } from '@windowcomputeruse/shared';
import type { WindowsRuntime } from './runtime-interface';

export interface AgentOrchestratorOptions {
  provider: ModelProvider;
  runtime: WindowsRuntime;
  maxSteps?: number;
  requireApprovalForActions?: boolean;
  onEvent?: (event: AgentEvent) => void;
}

export type AgentEventType =
  | 'task:started'
  | 'task:step'
  | 'task:approval_required'
  | 'task:completed'
  | 'task:failed'
  | 'task:stopped'
  | 'session:updated';

export interface AgentEvent {
  type: AgentEventType;
  taskId?: string;
  stepIndex?: number;
  payload?: unknown;
  timestamp: Date;
}
