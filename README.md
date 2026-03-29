# WindowComputerUse

A **Windows-first desktop application** that lets AI see your screen and control your computer — similar to Claude Computer Use. Powered by your own **GitHub Copilot** subscription (no extra API key required) and optionally connected to your own **Discord bot** for remote control.

> **Status:** Scaffold / Pre-alpha. Core architecture is in place; provider implementations are stubs awaiting production wiring.

---

## Features

- 🖥️ **Screen capture & AI vision** — captures your Windows screen and sends it to the AI for interpretation
- 🤖 **GitHub Copilot powered** — uses your own Copilot subscription via GitHub Device Flow (OAuth), no separate API key
- 💬 **Discord bot integration** — submit tasks and receive updates through your own Discord bot
- 🪟 **Native Windows desktop app** — distributed as a downloadable `.exe` installer
- 🔁 **Extensible provider model** — swap in other AI providers (OpenAI, Anthropic) without rewriting core logic

---

## Architecture

```
windowcomputeruse/
├── apps/
│   └── desktop/              # Electron desktop application (main + renderer)
│       ├── src/main/         # Node.js main process, IPC handlers, provider wiring
│       ├── src/preload/      # Secure context bridge (main ↔ renderer)
│       └── src/renderer/     # React UI (onboarding, agent console, screen preview)
└── packages/
    ├── shared/               # Shared TypeScript types & schemas
    ├── agent-core/           # Agent orchestration loop (Observe → Decide → Act)
    ├── windows-runtime/      # Windows screen capture & input control abstractions
    ├── copilot-provider/     # GitHub Copilot ModelProvider (device flow auth + API)
    └── discord-provider/     # Discord bot integration (slash commands)
```

### How it works

1. **Onboarding** — On first launch the user connects their GitHub Copilot account via GitHub Device Flow and optionally their Discord bot.
2. **Agent loop** — When a task is submitted the `AgentOrchestrator` runs a loop:
   - **Observe**: capture the current screen via `WindowsRuntime`
   - **Decide**: send the screenshot + goal to `GitHubCopilotProvider` → get next `AgentAction`
   - **Act**: execute the action via `InputController` (click, type, key, scroll, …)
   - **Repeat** until `done` or max steps reached
3. **Events** — all loop events are streamed to the renderer via IPC and displayed in the Agent Console
4. **Discord** — users can submit tasks via `/run` slash command; status updates are sent back to the channel

---

## Getting Started (Development)

### Prerequisites
- Node.js ≥ 20
- npm ≥ 10 (workspaces support)
- Windows 10/11 recommended (the runtime stubs run on any OS)

### Install & run
```bash
npm install
npm run dev          # starts the Electron app in dev mode
```

### Build & package as .exe
```bash
npm run package      # produces release/WindowComputerUse-Setup-*.exe
```

---

## Package overview

| Package | Purpose | Status |
|---|---|---|
| `@windowcomputeruse/shared` | Types, schemas, interfaces | ✅ Complete |
| `@windowcomputeruse/agent-core` | Orchestration loop, event emitter | ✅ Complete |
| `@windowcomputeruse/windows-runtime` | Screen capture + input control | 🔧 Stubs |
| `@windowcomputeruse/copilot-provider` | GitHub Copilot auth + model calls | 🔧 Stubs |
| `@windowcomputeruse/discord-provider` | Discord bot lifecycle + commands | 🔧 Stubs |
| `apps/desktop` | Electron shell + React UI | ✅ Scaffold |

---

## Next Implementation Steps

### 1. Wire real screen capture (`windows-runtime`)
Replace `ScreenCapture.captureBase64()` stub with one of:
- [`@nut-tree/nut-js`](https://nutjs.dev/) — cross-platform, great Windows support
- [`screenshot-desktop`](https://www.npmjs.com/package/screenshot-desktop) — simple, Windows-native
- Electron's `desktopCapturer` API (call from main process, pass base64 to runtime)

### 2. Wire real input control (`windows-runtime`)
Replace `InputController.execute()` stub with `@nut-tree/nut-js` or `robotjs`:
```bash
npm install @nut-tree/nut-js -w packages/windows-runtime
```

### 3. Complete GitHub Copilot auth (`copilot-provider`)
Replace stub `fetch` calls in `CopilotAuth`:
- `startDeviceFlow` → `POST https://github.com/login/device/code`
- `pollForToken` → `POST https://github.com/login/oauth/access_token`
- `exchangeForCopilotToken` → `GET https://api.github.com/copilot_internal/v2/token`
- Store credentials securely using `electron-store` or the OS keychain

### 4. Complete Copilot model calls (`copilot-provider`)
Implement `generateAction()` using:
```
POST https://api.githubcopilot.com/chat/completions
Authorization: Bearer <copilot_token>
Copilot-Integration-Id: vscode-chat
```
Send the screenshot as a base64 image message and parse the JSON action response.

### 5. Wire real Discord bot (`discord-provider`)
Install `discord.js` and replace stubs:
```bash
npm install discord.js -w packages/discord-provider
```
Implement slash command registration and `interactionCreate` handler.

### 6. Secure credential storage
Use `safeStorage` from Electron or OS keychain (e.g., `keytar`) to encrypt stored tokens.

### 7. Human-in-the-loop approvals
Add an approval step for dangerous actions (payment, deletion, etc.) via both the desktop UI and Discord confirmation buttons.

### 8. Build pipeline
Configure GitHub Actions for automated Windows builds:
```yaml
- uses: actions/checkout@v4
- run: npm ci
- run: npm run package -w apps/desktop
- uses: actions/upload-artifact@v4
  with:
    name: windows-installer
    path: apps/desktop/release/*.exe
```

---

## GitHub Copilot Integration Details

This app uses **GitHub Device Flow** — the same approach used by the GitHub CLI and editor extensions. No API key is required from the user; they simply log in with their GitHub account.

**Auth flow:**
1. App requests a `device_code` and `user_code` from GitHub
2. User visits `https://github.com/login/device` and enters the code
3. App polls until approved, then receives a GitHub OAuth token
4. Token is exchanged for a short-lived Copilot API token
5. Copilot API token is used for model calls (refreshed automatically)

**Important:** This integration relies on unofficial Copilot API endpoints used by editor extensions. It is intended for personal/BYOA (Bring Your Own Account) use only. Users connect their own Copilot subscription.

---

## Discord Integration Details

Users connect their **own Discord bot** (created in the Discord Developer Portal). The bot registers these slash commands:

| Command | Description |
|---|---|
| `/run [prompt]` | Submit a task to the AI agent |
| `/status [id]` | Check task status |
| `/stop [id]` | Stop a running task |
| `/approve [id]` | Approve a pending action |

---

## License

MIT
