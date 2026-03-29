import type { AgentAction } from './action';

/** Overall status of an agent task */
export type TaskStatus =
  | 'idle'
  | 'running'
  | 'waiting_approval'
  | 'paused'
  | 'completed'
  | 'failed'
  | 'stopped';

/** A single goal/task submitted to the agent */
export interface AgentTask {
  id: string;
  goal: string;
  status: TaskStatus;
  createdAt: Date;
  updatedAt: Date;
  steps: AgentStep[];
  source: 'desktop' | 'discord';
}

/** One step in the agent execution loop */
export interface AgentStep {
  id: string;
  taskId: string;
  index: number;
  observation: string;
  screenshotBase64?: string;
  action?: AgentAction;
  result?: string;
  error?: string;
  startedAt: Date;
  completedAt?: Date;
}
