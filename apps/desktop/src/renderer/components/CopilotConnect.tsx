import React, { useState } from 'react';

interface CopilotConnectProps {
  onConnected: () => void;
}

type Step = 'idle' | 'waiting_code' | 'waiting_approval' | 'done' | 'error';

export function CopilotConnect({ onConnected }: CopilotConnectProps): React.ReactElement {
  const [step, setStep] = useState<Step>('idle');
  const [userCode, setUserCode] = useState('');
  const [verificationUri, setVerificationUri] = useState('');
  const [error, setError] = useState('');
  const [login, setLogin] = useState('');

  async function handleStartAuth(): Promise<void> {
    setError('');
    setStep('waiting_code');
    try {
      const res = await window.api.copilot.startAuth();
      setUserCode(res.userCode);
      setVerificationUri(res.verificationUri);
      setStep('waiting_approval');
    } catch (e: unknown) {
      setError(String(e));
      setStep('error');
    }
  }

  async function handleOpenUrl(): Promise<void> {
    await window.api.copilot.openVerificationUrl(verificationUri);
  }

  async function handleWaitForApproval(): Promise<void> {
    setError('');
    try {
      const res = await window.api.copilot.waitForAuth();
      setLogin(res.login ?? '');
      setStep('done');
      onConnected();
    } catch (e: unknown) {
      setError(String(e));
      setStep('error');
    }
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Connect GitHub Copilot</h2>
      <p style={styles.description}>
        Connect your personal GitHub Copilot subscription. No API key needed — we use GitHub&apos;s secure device
        flow.
      </p>

      {step === 'idle' && (
        <button style={{ ...styles.btn, ...styles.btnPrimary }} onClick={handleStartAuth}>
          Connect GitHub Copilot
        </button>
      )}

      {step === 'waiting_code' && <p style={styles.hint}>Starting authentication…</p>}

      {step === 'waiting_approval' && (
        <div style={styles.codeBox}>
          <p style={styles.hint}>1. Open the verification page</p>
          <button style={{ ...styles.btn, ...styles.btnSecondary }} onClick={handleOpenUrl}>
            Open {verificationUri}
          </button>
          <p style={{ ...styles.hint, marginTop: 16 }}>2. Enter this code:</p>
          <div style={styles.userCode}>{userCode}</div>
          <p style={{ ...styles.hint, marginTop: 16 }}>3. After approving, click below</p>
          <button style={{ ...styles.btn, ...styles.btnPrimary, marginTop: 8 }} onClick={handleWaitForApproval}>
            I&apos;ve approved it →
          </button>
        </div>
      )}

      {step === 'done' && (
        <div style={styles.success}>
          <span>✅ Connected as <strong>{login || 'unknown'}</strong></span>
        </div>
      )}

      {step === 'error' && (
        <div>
          <div style={styles.error}>{error}</div>
          <button style={{ ...styles.btn, ...styles.btnSecondary }} onClick={handleStartAuth}>
            Try again
          </button>
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: { padding: '8px 0' },
  heading: { fontSize: 20, fontWeight: 700, color: '#e6edf3', marginBottom: 8 },
  description: { fontSize: 14, color: '#8b949e', marginBottom: 20, lineHeight: 1.5 },
  hint: { fontSize: 13, color: '#8b949e', marginBottom: 8 },
  btn: { display: 'inline-block', padding: '10px 18px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 600 },
  btnPrimary: { background: '#238636', color: '#fff' },
  btnSecondary: { background: '#21262d', color: '#e6edf3', border: '1px solid #30363d' },
  codeBox: { background: '#0d1117', borderRadius: 8, padding: 20, border: '1px solid #30363d' },
  userCode: { fontFamily: 'monospace', fontSize: 28, fontWeight: 700, letterSpacing: 4, color: '#58a6ff', margin: '8px 0' },
  success: { background: '#1a2d1f', borderRadius: 8, padding: 16, color: '#3fb950', fontSize: 15, border: '1px solid #2ea043' },
  error: { background: '#2d1a1a', borderRadius: 8, padding: 12, color: '#f85149', fontSize: 13, marginBottom: 12, border: '1px solid #da3633' },
};
