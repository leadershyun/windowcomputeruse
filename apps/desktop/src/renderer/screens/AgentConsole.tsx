import React, { useState, useEffect, useRef } from 'react';

interface AgentEvent {
  type: string;
  taskId?: string;
  stepIndex?: number;
  payload?: unknown;
  timestamp: string;
}

interface TaskLog {
  taskId: string;
  goal: string;
  events: AgentEvent[];
  status: string;
}

export function AgentConsole(): React.ReactElement {
  const [goal, setGoal] = useState('');
  const [running, setRunning] = useState(false);
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [logs, setLogs] = useState<AgentEvent[]>([]);
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null);
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.api.agent.onEvent((event: unknown) => {
      const e = event as AgentEvent;
      setLogs((prev) => [...prev, e]);

      if (e.type === 'task:completed' || e.type === 'task:failed' || e.type === 'task:stopped') {
        setRunning(false);
      }

      // Refresh screenshot on each step
      if (e.type === 'task:step') {
        const step = e.payload as { screenshotBase64?: string } | undefined;
        if (step?.screenshotBase64) {
          setScreenshot(step.screenshotBase64);
        }
      }
    });

    // Initial screenshot
    window.api.agent.captureScreen().then((base64: string) => setScreenshot(base64));
  }, []);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  async function handleRun(): Promise<void> {
    if (!goal.trim() || running) return;
    setRunning(true);
    setLogs([]);
    try {
      const res = await window.api.agent.run(goal.trim());
      setCurrentTaskId(res.taskId);
    } catch (e: unknown) {
      setRunning(false);
      setLogs((prev) => [
        ...prev,
        {
          type: 'task:failed',
          payload: { reason: String(e) },
          timestamp: new Date().toISOString(),
        },
      ]);
    }
  }

  async function handleStop(): Promise<void> {
    await window.api.agent.stop();
    setRunning(false);
  }

  return (
    <div style={styles.layout}>
      {/* Left panel: input + logs */}
      <div style={styles.leftPanel}>
        <div style={styles.header}>
          <h2 style={styles.title}>Agent Console</h2>
          {currentTaskId && <span style={styles.taskId}>Task: {currentTaskId.slice(0, 8)}…</span>}
        </div>

        <div style={styles.inputRow}>
          <input
            style={styles.input}
            type="text"
            placeholder="Describe what the AI should do…"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleRun()}
            disabled={running}
          />
          {!running ? (
            <button style={{ ...styles.btn, ...styles.btnPrimary }} onClick={handleRun}>
              Run
            </button>
          ) : (
            <button style={{ ...styles.btn, ...styles.btnDanger }} onClick={handleStop}>
              Stop
            </button>
          )}
        </div>

        <div style={styles.logContainer}>
          {logs.length === 0 && (
            <p style={styles.emptyLog}>No events yet. Enter a goal and press Run.</p>
          )}
          {logs.map((e, i) => (
            <LogEntry key={i} event={e} />
          ))}
          <div ref={logsEndRef} />
        </div>
      </div>

      {/* Right panel: screen preview */}
      <div style={styles.rightPanel}>
        <div style={styles.previewHeader}>Screen Preview</div>
        {screenshot ? (
          <img
            src={`data:image/png;base64,${screenshot}`}
            alt="Screen capture"
            style={styles.screenshot}
          />
        ) : (
          <div style={styles.noScreenshot}>
            <span style={{ fontSize: 32 }}>🖥️</span>
            <p>Screen preview will appear here</p>
          </div>
        )}
      </div>
    </div>
  );
}

function LogEntry({ event }: { event: AgentEvent }): React.ReactElement {
  const colors: Record<string, string> = {
    'task:started': '#58a6ff',
    'task:step': '#e3b341',
    'task:completed': '#3fb950',
    'task:failed': '#f85149',
    'task:stopped': '#8b949e',
  };

  const color = colors[event.type] ?? '#8b949e';
  const time = new Date(event.timestamp).toLocaleTimeString();

  let detail = '';
  if (event.type === 'task:step') {
    const step = event.payload as { observation?: string; action?: { type: string; reason?: string } } | undefined;
    detail = step ? `${step.observation ?? ''} → ${step.action?.type ?? ''}${step.action?.reason ? ` (${step.action.reason})` : ''}` : '';
  } else if (event.payload && typeof event.payload === 'object') {
    detail = JSON.stringify(event.payload).slice(0, 120);
  }

  return (
    <div style={{ ...styles.logEntry, borderLeft: `3px solid ${color}` }}>
      <span style={{ ...styles.logType, color }}>{event.type}</span>
      <span style={styles.logTime}>{time}</span>
      {detail && <div style={styles.logDetail}>{detail}</div>}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  layout: { display: 'flex', height: '100vh', overflow: 'hidden' },
  leftPanel: { flex: '0 0 420px', display: 'flex', flexDirection: 'column', background: '#0d1117', borderRight: '1px solid #30363d', overflow: 'hidden' },
  header: { padding: '16px 20px', borderBottom: '1px solid #30363d', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontSize: 18, fontWeight: 700, color: '#e6edf3' },
  taskId: { fontSize: 11, color: '#8b949e', fontFamily: 'monospace' },
  inputRow: { display: 'flex', gap: 8, padding: '12px 16px', borderBottom: '1px solid #30363d' },
  input: { flex: 1, background: '#161b22', border: '1px solid #30363d', borderRadius: 6, padding: '8px 12px', color: '#e6edf3', fontSize: 14, outline: 'none' },
  btn: { padding: '8px 16px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 600, whiteSpace: 'nowrap' },
  btnPrimary: { background: '#238636', color: '#fff' },
  btnDanger: { background: '#da3633', color: '#fff' },
  logContainer: { flex: 1, overflowY: 'auto', padding: '8px 16px' },
  emptyLog: { color: '#8b949e', fontSize: 13, textAlign: 'center', marginTop: 32 },
  logEntry: { padding: '8px 12px', marginBottom: 6, background: '#161b22', borderRadius: 4, paddingLeft: 12 },
  logType: { fontSize: 12, fontWeight: 700, marginRight: 8 },
  logTime: { fontSize: 11, color: '#8b949e' },
  logDetail: { fontSize: 12, color: '#8b949e', marginTop: 4, wordBreak: 'break-all' },
  rightPanel: { flex: 1, display: 'flex', flexDirection: 'column', background: '#0d1117', overflow: 'hidden' },
  previewHeader: { padding: '16px 20px', borderBottom: '1px solid #30363d', fontSize: 14, fontWeight: 600, color: '#8b949e' },
  screenshot: { flex: 1, objectFit: 'contain', width: '100%', height: 'calc(100vh - 53px)' },
  noScreenshot: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#8b949e', gap: 12 },
};
