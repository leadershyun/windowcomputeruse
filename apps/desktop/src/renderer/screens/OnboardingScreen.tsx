import React, { useState } from 'react';
import { CopilotConnect } from '../components/CopilotConnect';
import { DiscordConnect } from '../components/DiscordConnect';

interface OnboardingScreenProps {
  copilotConnected: boolean;
  discordConnected: boolean;
  onCopilotConnected: () => void;
  onDiscordConnected: () => void;
  onEnterApp: () => void;
}

export function OnboardingScreen({
  copilotConnected,
  discordConnected,
  onCopilotConnected,
  onDiscordConnected,
  onEnterApp,
}: OnboardingScreenProps): React.ReactElement {
  const [step, setStep] = useState<'copilot' | 'discord' | 'ready'>(
    copilotConnected ? (discordConnected ? 'ready' : 'discord') : 'copilot',
  );

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {/* Logo / Title */}
        <div style={styles.header}>
          <h1 style={styles.title}>WindowComputerUse</h1>
          <p style={styles.subtitle}>AI-powered Windows computer use agent</p>
        </div>

        {/* Step indicators */}
        <div style={styles.steps}>
          <StepDot label="1. GitHub Copilot" active={step === 'copilot'} done={copilotConnected} />
          <div style={styles.stepLine} />
          <StepDot label="2. Discord Bot" active={step === 'discord'} done={discordConnected} />
          <div style={styles.stepLine} />
          <StepDot label="3. Ready" active={step === 'ready'} done={false} />
        </div>

        {/* Step content */}
        {step === 'copilot' && (
          <CopilotConnect
            onConnected={() => {
              onCopilotConnected();
              setStep('discord');
            }}
          />
        )}

        {step === 'discord' && (
          <DiscordConnect
            onConnected={() => {
              onDiscordConnected();
              setStep('ready');
            }}
            onSkip={() => setStep('ready')}
          />
        )}

        {step === 'ready' && (
          <div style={styles.ready}>
            <div style={styles.readyIcon}>🚀</div>
            <h2 style={styles.readyTitle}>You&apos;re all set!</h2>
            <p style={styles.readyDesc}>
              {copilotConnected
                ? 'GitHub Copilot is connected.'
                : 'GitHub Copilot is not connected — please go back and connect it.'}
            </p>
            {discordConnected && <p style={styles.readyDesc}>Discord bot is connected.</p>}
            <button
              style={{ ...styles.btn, ...styles.btnPrimary }}
              onClick={onEnterApp}
              disabled={!copilotConnected}
            >
              Launch Agent Console →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function StepDot({ label, active, done }: { label: string; active: boolean; done: boolean }): React.ReactElement {
  return (
    <div style={styles.stepDotWrapper}>
      <div
        style={{
          ...styles.stepDot,
          background: done ? '#2da44e' : active ? '#0969da' : '#333',
          border: active ? '2px solid #58a6ff' : '2px solid transparent',
        }}
      >
        {done ? '✓' : ''}
      </div>
      <span style={{ ...styles.stepLabel, color: active ? '#e0e0e0' : '#888' }}>{label}</span>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: { display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#0d1117', padding: 24 },
  card: { background: '#161b22', borderRadius: 12, padding: '40px 48px', width: '100%', maxWidth: 560, border: '1px solid #30363d' },
  header: { textAlign: 'center', marginBottom: 32 },
  title: { fontSize: 28, fontWeight: 700, color: '#e6edf3', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#8b949e' },
  steps: { display: 'flex', alignItems: 'flex-start', justifyContent: 'center', marginBottom: 36, gap: 0 },
  stepDotWrapper: { display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 110 },
  stepDot: { width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: '#fff', fontWeight: 700, marginBottom: 8 },
  stepLabel: { fontSize: 11, textAlign: 'center', lineHeight: 1.3 },
  stepLine: { flex: 1, height: 2, background: '#30363d', marginTop: 16 },
  ready: { textAlign: 'center', padding: '16px 0' },
  readyIcon: { fontSize: 48, marginBottom: 16 },
  readyTitle: { fontSize: 22, fontWeight: 700, color: '#e6edf3', marginBottom: 12 },
  readyDesc: { fontSize: 14, color: '#8b949e', marginBottom: 8 },
  btn: { display: 'inline-block', padding: '10px 20px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 15, fontWeight: 600, marginTop: 16 },
  btnPrimary: { background: '#238636', color: '#fff' },
};
