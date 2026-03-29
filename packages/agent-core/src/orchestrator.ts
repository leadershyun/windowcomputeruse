import { randomUUID } from 'crypto';
import type { AgentTask, AgentStep, AgentAction } from '@windowcomputeruse/shared';
import type { AgentOrchestratorOptions } from './types';
import { AgentEventEmitter } from './events';

const DEFAULT_MAX_STEPS = 50;

/**
 * AgentOrchestrator drives the Observe → Decide → Act loop.
 *
 * Usage:
 *   const orch = new AgentOrchestrator({ provider, runtime });
 *   orch.events.on('task:step', e => console.log(e));
 *   const task = await orch.runTask('Open Notepad and type hello');
 */
export class AgentOrchestrator {
  readonly events = new AgentEventEmitter();
  private running = false;

  constructor(private readonly opts: AgentOrchestratorOptions) {}

  async runTask(goal: string, source: AgentTask['source'] = 'desktop'): Promise<AgentTask> {
    if (this.running) {
      throw new Error('An agent task is already running. Stop it before starting a new one.');
    }

    const task: AgentTask = {
      id: randomUUID(),
      goal,
      source,
      status: 'running',
      createdAt: new Date(),
      updatedAt: new Date(),
      steps: [],
    };

    this.running = true;
    this.events.emit({ type: 'task:started', taskId: task.id, payload: { goal }, timestamp: new Date() });

    try {
      await this._loop(task);
    } finally {
      this.running = false;
    }

    return task;
  }

  stop(): void {
    this.running = false;
  }

  private async _loop(task: AgentTask): Promise<void> {
    const maxSteps = this.opts.maxSteps ?? DEFAULT_MAX_STEPS;
    const history: Array<{ observation: string; action: string }> = [];

    for (let i = 0; i < maxSteps && this.running; i++) {
      // 1. Observe
      const screenshotBase64 = await this.opts.runtime.captureScreen();
      const sessionState = await this.opts.runtime.getSessionState();
      const observation = `Step ${i + 1}. Window: ${sessionState.currentWindowTitle ?? 'unknown'}`;

      // 2. Decide
      const output = await this.opts.provider.generateAction({
        goal: task.goal,
        screenshotBase64,
        history,
        systemPrompt: this._systemPrompt(),
      });

      const step: AgentStep = {
        id: randomUUID(),
        taskId: task.id,
        index: i,
        observation,
        screenshotBase64,
        action: output.action,
        startedAt: new Date(),
      };
      task.steps.push(step);
      task.updatedAt = new Date();

      this.events.emit({
        type: 'task:step',
        taskId: task.id,
        stepIndex: i,
        payload: step,
        timestamp: new Date(),
      });

      // 3. Act
      if (output.action.type === 'done') {
        step.result = 'Task completed by agent.';
        step.completedAt = new Date();
        task.status = 'completed';
        this.events.emit({ type: 'task:completed', taskId: task.id, timestamp: new Date() });
        return;
      }

      const result = await this.opts.runtime.executeAction(output.action);
      step.result = result.success ? 'ok' : result.error;
      step.completedAt = new Date();

      history.push({ observation, action: JSON.stringify(output.action) });
    }

    if (task.status === 'running') {
      task.status = 'failed';
      task.updatedAt = new Date();
      this.events.emit({
        type: 'task:failed',
        taskId: task.id,
        payload: { reason: 'Max steps reached' },
        timestamp: new Date(),
      });
    }
  }

  private _systemPrompt(): string {
    return [
      'You are a Windows computer-use agent.',
      'You receive a screenshot of the current screen and decide the next action.',
      'Return a JSON object with an "action" field matching the AgentAction schema.',
      'When the task is complete, return { "action": { "type": "done" } }.',
      'Always include a "reason" field explaining why you chose this action.',
    ].join('\n');
  }
}
