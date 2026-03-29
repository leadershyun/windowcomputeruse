import type { AgentEvent, AgentEventType } from './types';

type Listener = (event: AgentEvent) => void;

export class AgentEventEmitter {
  private listeners = new Map<AgentEventType | '*', Set<Listener>>();

  on(type: AgentEventType | '*', listener: Listener): this {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }
    this.listeners.get(type)!.add(listener);
    return this;
  }

  off(type: AgentEventType | '*', listener: Listener): this {
    this.listeners.get(type)?.delete(listener);
    return this;
  }

  emit(event: AgentEvent): void {
    this.listeners.get(event.type)?.forEach((l) => l(event));
    this.listeners.get('*')?.forEach((l) => l(event));
  }
}
