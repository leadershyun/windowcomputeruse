import React, { useState } from 'react';

interface DiscordConnectProps {
  onConnected: () => void;
  onSkip: () => void;
}

export function DiscordConnect({ onConnected, onSkip }: DiscordConnectProps): React.ReactElement {
  const [botToken, setBotToken] = useState('');
  const [guildId, setGuildId] = useState('');
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState('');
  const [connected, setConnected] = useState(false);

  async function handleConnect(): Promise<void> {
    if (!botToken.trim()) {
      setError('Bot token is required.');
      return;
    }
    setError('');
    setConnecting(true);
    try {
      await window.api.discord.connect({ botToken: botToken.trim(), guildId: guildId.trim() || undefined });
      setConnected(true);
      onConnected();
    } catch (e: unknown) {
      setError(String(e));
    } finally {
      setConnecting(false);
    }
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Connect Discord Bot</h2>
      <p style={styles.description}>
        Connect your own Discord bot to receive commands via slash commands (/run, /status, /stop). You can also
        skip this step.
      </p>

      {!connected && (
        <>
          <div style={styles.field}>
            <label style={styles.label}>Bot Token *</label>
            <input
              style={styles.input}
              type="password"
              placeholder="Paste your Discord bot token here"
              value={botToken}
              onChange={(e) => setBotToken(e.target.value)}
            />
            <p style={styles.hint}>
              Get your token at{' '}
              <a
                style={styles.link}
                href="https://discord.com/developers/applications"
                onClick={(e) => {
                  e.preventDefault();
                  window.api.copilot.openVerificationUrl('https://discord.com/developers/applications');
                }}
              >
                discord.com/developers
              </a>
            </p>
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Guild / Server ID (optional)</label>
            <input
              style={styles.input}
              type="text"
              placeholder="Your Discord server ID (for instant command registration)"
              value={guildId}
              onChange={(e) => setGuildId(e.target.value)}
            />
          </div>

          {error && <div style={styles.error}>{error}</div>}

          <div style={styles.actions}>
            <button
              style={{ ...styles.btn, ...styles.btnPrimary }}
              onClick={handleConnect}
              disabled={connecting}
            >
              {connecting ? 'Connecting…' : 'Connect Bot'}
            </button>
            <button style={{ ...styles.btn, ...styles.btnGhost }} onClick={onSkip}>
              Skip for now
            </button>
          </div>
        </>
      )}

      {connected && (
        <div style={styles.success}>✅ Discord bot connected successfully!</div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: { padding: '8px 0' },
  heading: { fontSize: 20, fontWeight: 700, color: '#e6edf3', marginBottom: 8 },
  description: { fontSize: 14, color: '#8b949e', marginBottom: 20, lineHeight: 1.5 },
  field: { marginBottom: 16 },
  label: { display: 'block', fontSize: 13, fontWeight: 600, color: '#e6edf3', marginBottom: 6 },
  input: { width: '100%', background: '#0d1117', border: '1px solid #30363d', borderRadius: 6, padding: '8px 12px', color: '#e6edf3', fontSize: 14, outline: 'none' },
  hint: { fontSize: 12, color: '#8b949e', marginTop: 4 },
  link: { color: '#58a6ff' },
  error: { background: '#2d1a1a', borderRadius: 8, padding: 12, color: '#f85149', fontSize: 13, marginBottom: 12, border: '1px solid #da3633' },
  actions: { display: 'flex', gap: 12, marginTop: 8 },
  btn: { padding: '10px 18px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 600 },
  btnPrimary: { background: '#238636', color: '#fff' },
  btnGhost: { background: 'transparent', color: '#8b949e', border: '1px solid #30363d' },
  success: { background: '#1a2d1f', borderRadius: 8, padding: 16, color: '#3fb950', fontSize: 15, border: '1px solid #2ea043' },
};
