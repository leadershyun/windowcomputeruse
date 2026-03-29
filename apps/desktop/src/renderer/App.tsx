import React, { useState, useEffect } from 'react';
import { OnboardingScreen } from './screens/OnboardingScreen';
import { AgentConsole } from './screens/AgentConsole';

type Screen = 'onboarding' | 'console';

interface AppState {
  copilotConnected: boolean;
  discordConnected: boolean;
}

export function App(): React.ReactElement {
  const [screen, setScreen] = useState<Screen>('onboarding');
  const [state, setState] = useState<AppState>({
    copilotConnected: false,
    discordConnected: false,
  });

  useEffect(() => {
    // Check initial connection status
    Promise.all([
      window.api.copilot.getStatus(),
      window.api.discord.getStatus(),
    ]).then(([copilot, discord]) => {
      setState({ copilotConnected: copilot.authenticated, discordConnected: discord.connected });
      if (copilot.authenticated) {
        setScreen('console');
      }
    });
  }, []);

  if (screen === 'onboarding') {
    return (
      <OnboardingScreen
        copilotConnected={state.copilotConnected}
        discordConnected={state.discordConnected}
        onCopilotConnected={() => {
          setState((s) => ({ ...s, copilotConnected: true }));
        }}
        onDiscordConnected={() => {
          setState((s) => ({ ...s, discordConnected: true }));
        }}
        onEnterApp={() => setScreen('console')}
      />
    );
  }

  return <AgentConsole />;
}
