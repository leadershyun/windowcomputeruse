/** Runtime session state */
export interface SessionState {
  id: string;
  isCapturing: boolean;
  lastScreenshotAt?: Date;
  currentWindowTitle?: string;
  resolution?: { width: number; height: number };
}
