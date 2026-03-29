import { app, BrowserWindow, ipcMain, shell } from 'electron';
import path from 'path';
import Store from 'electron-store';
import { GitHubCopilotProvider } from '@windowcomputeruse/copilot-provider';
import { DiscordProvider } from '@windowcomputeruse/discord-provider';
import { AgentOrchestrator } from '@windowcomputeruse/agent-core';
import { WindowsRuntimeImpl } from '@windowcomputeruse/windows-runtime';
import type { CopilotCredentials } from '@windowcomputeruse/copilot-provider';
import type { DiscordConfig } from '@windowcomputeruse/discord-provider';

// ---------- Persistent store ----------
interface StoreSchema {
  copilotCredentials: CopilotCredentials | null;
  discordConfig: DiscordConfig | null;
  selectedModel: string;
}

const store = new Store<StoreSchema>({
  name: 'windowcomputeruse',
  defaults: {
    copilotCredentials: null,
    discordConfig: null,
    selectedModel: 'gpt-4o',
  },
});

// ---------- Providers ----------
const copilotProvider = new GitHubCopilotProvider();
const discordProvider = new DiscordProvider();
const runtime = new WindowsRuntimeImpl();
let orchestrator: AgentOrchestrator | null = null;

function getOrchestrator(): AgentOrchestrator {
  if (!orchestrator) {
    orchestrator = new AgentOrchestrator({ provider: copilotProvider, runtime });
    orchestrator.events.on('*', (event) => {
      mainWindow?.webContents.send('agent:event', event);
    });
  }
  return orchestrator;
}

// ---------- Window ----------
let mainWindow: BrowserWindow | null = null;

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    title: 'WindowComputerUse',
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (process.env.ELECTRON_RENDERER_URL) {
    mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL);
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// ---------- App lifecycle ----------
app.whenReady().then(() => {
  createWindow();

  // Restore stored credentials
  const storedCreds = store.get('copilotCredentials');
  if (storedCreds) {
    copilotProvider.setCredentials(storedCreds);
  }

  const storedDiscord = store.get('discordConfig');
  if (storedDiscord) {
    discordProvider.connect(storedDiscord).catch(console.error);
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// ---------- IPC: GitHub Copilot ----------
ipcMain.handle('copilot:getStatus', async () => {
  const auth = await copilotProvider.isAuthenticated();
  const creds = copilotProvider.getCredentials();
  return { authenticated: auth, login: creds?.login };
});

ipcMain.handle('copilot:startAuth', async () => {
  const { userCode, verificationUri } = await copilotProvider.startAuthFlow();
  return { userCode, verificationUri };
});

ipcMain.handle('copilot:openVerificationUrl', async (_e, url: string) => {
  await shell.openExternal(url);
});

ipcMain.handle('copilot:waitForAuth', async () => {
  await copilotProvider.waitForAuth();
  const creds = copilotProvider.getCredentials();
  if (creds) store.set('copilotCredentials', creds);
  return { login: creds?.login };
});

ipcMain.handle('copilot:disconnect', async () => {
  await copilotProvider.disconnect();
  store.delete('copilotCredentials');
});

ipcMain.handle('copilot:listModels', async () => {
  return copilotProvider.listModels();
});

// ---------- IPC: Discord ----------
ipcMain.handle('discord:getStatus', () => {
  return { connected: discordProvider.isConnected() };
});

ipcMain.handle('discord:connect', async (_e, config: DiscordConfig) => {
  await discordProvider.connect(config);
  store.set('discordConfig', config);
  return { connected: true };
});

ipcMain.handle('discord:disconnect', async () => {
  await discordProvider.disconnect();
  store.delete('discordConfig');
});

// ---------- IPC: Agent ----------
ipcMain.handle('agent:run', async (_e, goal: string) => {
  const orch = getOrchestrator();
  const task = await orch.runTask(goal);
  return { taskId: task.id, status: task.status };
});

ipcMain.handle('agent:stop', () => {
  orchestrator?.stop();
});

ipcMain.handle('agent:captureScreen', async () => {
  return runtime.captureScreen();
});
