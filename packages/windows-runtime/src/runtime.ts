import type { AgentAction, SessionState } from '@windowcomputeruse/shared';
import type { WindowsRuntime } from '@windowcomputeruse/agent-core';
import { ScreenCapture } from './screen-capture';
import { InputController } from './input-controller';

/**
 * Windows-native implementation of WindowsRuntime.
 *
 * Currently uses stub/placeholder implementations.
 * Replace with real native bindings in production
 * (e.g., robotjs, @nut-tree/nut-js, or a custom native addon).
 */
export class WindowsRuntimeImpl implements WindowsRuntime {
  private captureInterval?: ReturnType<typeof setInterval>;
  private screenCapture = new ScreenCapture();
  private inputController = new InputController();

  async captureScreen(): Promise<string> {
    return this.screenCapture.captureBase64();
  }

  async executeAction(action: AgentAction): Promise<{ success: boolean; error?: string }> {
    return this.inputController.execute(action);
  }

  async getSessionState(): Promise<SessionState> {
    return {
      id: 'default',
      isCapturing: this.captureInterval != null,
      lastScreenshotAt: new Date(),
      currentWindowTitle: 'Unknown',
      resolution: { width: 1920, height: 1080 },
    };
  }

  startCapture(intervalMs: number): void {
    if (this.captureInterval) return;
    this.captureInterval = setInterval(() => {
      this.screenCapture.captureBase64().catch(console.error);
    }, intervalMs);
  }

  stopCapture(): void {
    if (this.captureInterval) {
      clearInterval(this.captureInterval);
      this.captureInterval = undefined;
    }
  }
}
