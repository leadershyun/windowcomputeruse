/**
 * ScreenCapture — Windows screen capture abstraction.
 *
 * ## Current Status: STUB
 * Returns a 1×1 transparent PNG encoded as base64.
 *
 * ## TODO: Production Implementation
 * Replace with one of:
 * - `@nut-tree/nut-js` screenshot API (cross-platform, works on Windows)
 * - `screenshot-desktop` npm package
 * - Electron's `desktopCapturer` API (when running inside Electron main process)
 * - A native Node addon using Windows GDI / DXGI
 *
 * The method must return a base64-encoded PNG string of the full primary display.
 */
export class ScreenCapture {
  // 1x1 transparent PNG (stub)
  private readonly STUB_PNG =
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

  async captureBase64(): Promise<string> {
    // STUB: Replace with real implementation
    return this.STUB_PNG;
  }
}
