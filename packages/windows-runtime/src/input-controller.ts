import type { AgentAction } from '@windowcomputeruse/shared';

/**
 * InputController — abstracts mouse/keyboard input on Windows.
 *
 * ## Current Status: STUB
 * Logs the action and returns success without performing any real input.
 *
 * ## TODO: Production Implementation
 * Replace with one of:
 * - `@nut-tree/nut-js` — cross-platform, supports Windows
 * - `robotjs` — lightweight native module
 * - A custom Windows native addon (SendInput / SetCursorPos)
 *
 * Each action type must be dispatched to the appropriate OS call.
 */
export class InputController {
  async execute(action: AgentAction): Promise<{ success: boolean; error?: string }> {
    // STUB: log and no-op
    console.log('[InputController][STUB] execute:', JSON.stringify(action));
    return { success: true };
  }
}
