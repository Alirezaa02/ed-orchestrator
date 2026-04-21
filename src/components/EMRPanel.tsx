import { useEffect, useRef } from 'react';
import type { EMREntry, AgentOutputMap } from '../lib/types';
import { AlertTriangle } from 'lucide-react';

type ErrorType = 'rateLimit' | 'network' | 'timeout' | 'empty' | 'unknown' | null;

const ERROR_MESSAGES: Record<NonNullable<ErrorType>, { title: string; body: string }> = {
  rateLimit: { title: 'Rate Limit Exceeded',    body: 'The AI service is busy. Wait ~60s then retry.' },
  network:   { title: 'Cannot Reach n8n',       body: 'Make sure n8n is running on localhost:5678 and the workflow is published.' },
  timeout:   { title: 'Request Timed Out',      body: 'No response after 120s. n8n may still be processing — check the Executions tab.' },
  empty:     { title: 'Empty Response',         body: 'n8n returned no data. Check the Executions tab for a failed node.' },
  unknown:   { title: 'Error',                  body: '' },
};

interface Props {
  log: EMREntry[];
  agentOutput: AgentOutputMap;
  agentColors: Record<string, string>;
  error: string | null;
  errorType: ErrorType;
  running: boolean;
  onRetry: () => void;
}

const AGENT_COLOR_MAP: Record<string, string> = {
  patientAgent:  '#60a5fa',
  triageAgent:   '#c084fc',
  nurseAgent:    '#4ade80',
  doctorAgent:   '#fbbf24',
  decisionAgent: '#f87171',
};

const DOT_COLOR: Record<EMREntry['type'], string> = {
  info:    '#475569',
  action:  '#3b82f6',
  result:  '#22c55e',
  warning: '#f97316',
};

const TEXT_COLOR: Record<EMREntry['type'], string> = {
  info:    '#94a3b8',
  action:  '#64748b',
  result:  '#e2e8f0',
  warning: '#fb923c',
};

function ProbBar({ label, value, color }: { label: string; value: number | null; color: string }) {
  const pct = value !== null ? Math.round(value * 100) : null;
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
        <span style={{ fontSize: 12, color: '#94a3b8' }}>{label}</span>
        <span style={{ fontSize: 12, color: '#e2e8f0', fontFamily: 'monospace', fontWeight: 600 }}>
          {pct !== null ? `${pct}%` : '—'}
        </span>
      </div>
      <div style={{ height: 6, background: '#1e293b', borderRadius: 4, overflow: 'hidden' }}>
        <div style={{
          height: '100%',
          width: pct !== null ? `${pct}%` : '0%',
          background: color,
          borderRadius: 4,
          transition: 'width 0.8s ease',
        }} />
      </div>
    </div>
  );
}

export default function EMRPanel({ log, agentOutput, error, errorType, running, onRetry }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const outcome = agentOutput.decisionAgent;

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [log]);

  const dispStyle = !outcome ? null :
    outcome.disposition === 'Admit to Hospital' ? { bg: '#1c0a0a', border: '#ef4444', color: '#fca5a5' } :
    outcome.disposition === 'Short Stay Unit'   ? { bg: '#1c1205', border: '#f59e0b', color: '#fde68a' } :
    { bg: '#051c0f', border: '#22c55e', color: '#86efac' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#0c1018' }}>

      {/* Header */}
      <div style={{ padding: '20px 20px', borderBottom: '1px solid #1e293b' }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: '#f1f5f9', margin: 0, marginBottom: 4 }}>EMR Live Log</h2>
        <p style={{ fontSize: 12, color: '#64748b', margin: 0 }}>Real-time agent activity</p>
      </div>

      {/* Log */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', minHeight: 0 }}>
        {log.length === 0 && !error && (
          <div style={{ textAlign: 'center', paddingTop: 40 }}>
            <p style={{ fontSize: 13, color: '#334155', margin: 0 }}>No activity yet.</p>
            <p style={{ fontSize: 12, color: '#1e293b', margin: '6px 0 0' }}>Start a simulation to see live logs.</p>
          </div>
        )}

        {log.map(entry => (
          <div key={entry.id} style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
            <div style={{ paddingTop: 5, flexShrink: 0 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: DOT_COLOR[entry.type] }} />
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 2, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 10, color: '#334155', fontFamily: 'monospace' }}>{entry.ts}</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: AGENT_COLOR_MAP[entry.agentId] ?? '#64748b' }}>
                  {entry.agent}
                </span>
              </div>
              <p style={{
                fontSize: 12,
                color: TEXT_COLOR[entry.type],
                margin: 0,
                lineHeight: 1.5,
                fontStyle: entry.type === 'action' ? 'italic' : 'normal',
                fontWeight: entry.type === 'result' ? 500 : 400,
              }}>
                {entry.message}
              </p>
            </div>
          </div>
        ))}

        {error && errorType && (
          <div style={{
            padding: '12px 14px',
            background: '#1c0a0a', border: '1px solid #7f1d1d', borderRadius: 10, marginBottom: 12,
          }}>
            <div style={{ display: 'flex', gap: 10, marginBottom: 8 }}>
              <AlertTriangle size={14} color="#ef4444" style={{ flexShrink: 0, marginTop: 1 }} />
              <div>
                <p style={{ fontSize: 12, fontWeight: 700, color: '#fca5a5', margin: '0 0 4px' }}>
                  {ERROR_MESSAGES[errorType].title}
                </p>
                <p style={{ fontSize: 12, color: '#f87171', margin: 0 }}>
                  {ERROR_MESSAGES[errorType].body || error}
                </p>
              </div>
            </div>
            <button onClick={onRetry} style={{
              width: '100%', padding: '7px', borderRadius: 8, border: '1px solid #7f1d1d',
              background: '#2d0a0a', color: '#fca5a5', fontSize: 12, fontWeight: 600, cursor: 'pointer',
            }}>
              Try Again
            </button>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Outcome */}
      <div style={{ borderTop: '1px solid #1e293b', padding: '16px 20px', flexShrink: 0 }}>
        <p style={{ fontSize: 10, fontWeight: 600, color: '#475569', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>
          Predicted Outcome
        </p>

        {outcome && dispStyle ? (
          <>
            <div style={{
              background: dispStyle.bg, border: `1px solid ${dispStyle.border}`,
              borderRadius: 10, padding: '12px 14px', marginBottom: 12,
            }}>
              <p style={{ fontSize: 14, fontWeight: 700, color: dispStyle.color, margin: 0, marginBottom: 3 }}>
                {outcome.disposition}
              </p>
              <p style={{ fontSize: 11, color: '#64748b', margin: 0 }}>
                {Math.round(outcome.confidence * 100)}% confidence
              </p>
            </div>
            <ProbBar label="Admit to Hospital" value={outcome.probabilities.admit}     color="#ef4444" />
            <ProbBar label="Short Stay Unit"   value={outcome.probabilities.shortStay} color="#f59e0b" />
            <ProbBar label="Discharge Home"    value={outcome.probabilities.discharge} color="#22c55e" />
            {outcome.rationale && (
              <p style={{ fontSize: 11, color: '#475569', lineHeight: 1.5, margin: '8px 0 0' }}>{outcome.rationale}</p>
            )}
          </>
        ) : (
          <>
            <ProbBar label="Admit to Hospital" value={running ? null : 0} color="#ef4444" />
            <ProbBar label="Short Stay Unit"   value={running ? null : 0} color="#f59e0b" />
            <ProbBar label="Discharge Home"    value={running ? null : 0} color="#22c55e" />
          </>
        )}
      </div>
    </div>
  );
}
