import { contextBridge, ipcRenderer } from 'electron';

/**
 * Expose a safe, typed API to the renderer process.
 * All IPC calls go through this bridge (no direct Node.js access in renderer).
 */
contextBridge.exposeInMainWorld('api', {
  // ── Copilot ──────────────────────────────────────────────────────────────
  copilot: {
    getStatus: () => ipcRenderer.invoke('copilot:getStatus'),
    startAuth: () => ipcRenderer.invoke('copilot:startAuth'),
    openVerificationUrl: (url: string) => ipcRenderer.invoke('copilot:openVerificationUrl', url),
    waitForAuth: () => ipcRenderer.invoke('copilot:waitForAuth'),
    disconnect: () => ipcRenderer.invoke('copilot:disconnect'),
    listModels: () => ipcRenderer.invoke('copilot:listModels'),
  },

  // ── Discord ───────────────────────────────────────────────────────────────
  discord: {
    getStatus: () => ipcRenderer.invoke('discord:getStatus'),
    connect: (config: { botToken: string; guildId?: string }) =>
      ipcRenderer.invoke('discord:connect', config),
    disconnect: () => ipcRenderer.invoke('discord:disconnect'),
  },

  // ── Agent ─────────────────────────────────────────────────────────────────
  agent: {
    run: (goal: string) => ipcRenderer.invoke('agent:run', goal),
    stop: () => ipcRenderer.invoke('agent:stop'),
    captureScreen: () => ipcRenderer.invoke('agent:captureScreen'),
    onEvent: (callback: (event: unknown) => void) => {
      ipcRenderer.on('agent:event', (_e, event) => callback(event));
    },
    offEvent: (callback: (event: unknown) => void) => {
      ipcRenderer.removeListener('agent:event', (_e, event) => callback(event));
    },
  },
});
