import type { AgentState } from '../lib/types';
import { CheckCircle2, Clock, Loader2, Circle } from 'lucide-react';

interface Props {
  agents: AgentState[];
  step: number;
  running: boolean;
}

const AGENT_ACCENT: Record<string, { color: string; bg: string; border: string }> = {
  patientAgent:  { color: '#60a5fa', bg: 'rgba(59,130,246,0.1)',  border: '#3b82f6' },
  triageAgent:   { color: '#c084fc', bg: 'rgba(168,85,247,0.1)', border: '#a855f7' },
  nurseAgent:    { color: '#4ade80', bg: 'rgba(34,197,94,0.1)',  border: '#22c55e' },
  doctorAgent:   { color: '#fbbf24', bg: 'rgba(245,158,11,0.1)', border: '#f59e0b' },
  decisionAgent: { color: '#f87171', bg: 'rgba(239,68,68,0.1)',  border: '#ef4444' },
};

const JOURNEY = ['Arrival', 'Register', 'Triage', 'Nurse', 'Doctor', 'Disposition'];

function StatusBadge({ status }: { status: AgentState['status'] }) {
  const styles: Record<AgentState['status'], { bg: string; color: string; label: string }> = {
    done:    { bg: 'rgba(34,197,94,0.15)',  color: '#4ade80', label: 'Done' },
    active:  { bg: 'rgba(59,130,246,0.15)', color: '#60a5fa', label: 'Active' },
    pending: { bg: 'rgba(245,158,11,0.15)', color: '#fbbf24', label: 'Pending' },
    waiting: { bg: 'rgba(100,116,139,0.15)',color: '#64748b', label: 'Waiting' },
  };
  const s = styles[status];
  return (
    <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20, background: s.bg, color: s.color }}>
      {s.label}
    </span>
  );
}

function StatusIcon({ status }: { status: AgentState['status'] }) {
  if (status === 'done')    return <CheckCircle2 size={16} color="#4ade80" />;
  if (status === 'active')  return <Loader2 size={16} color="#60a5fa" style={{ animation: 'spin 1s linear infinite' }} />;
  if (status === 'pending') return <Clock size={16} color="#fbbf24" />;
  return <Circle size={16} color="#334155" />;
}

export default function PipelinePanel({ agents, step, running }: Props) {
  const done = agents.filter(a => a.status === 'done').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#0a0d14' }}>

      {/* Header */}
      <div style={{ padding: '20px 24px', borderBottom: '1px solid #1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#f1f5f9', margin: 0, marginBottom: 4 }}>Agent Pipeline — live</h2>
          <p style={{ fontSize: 12, color: '#64748b', margin: 0 }}>
            {running ? `Active agents: ${done + 1}/5` : done > 0 ? `Completed — ${done}/5 agents ran` : 'Ready to run'}
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {running && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#60a5fa' }}>
              <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} />
              Processing
            </div>
          )}
          <span style={{ fontSize: 12, color: '#64748b', background: '#1e293b', padding: '4px 12px', borderRadius: 8 }}>
            Step {Math.min(step + 1, 6)} of 6
          </span>
        </div>
      </div>

      {/* Agent Cards */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
        {agents.map((agent, idx) => {
          const accent = AGENT_ACCENT[agent.id] ?? AGENT_ACCENT.patientAgent;
          const isActive = agent.status === 'active';
          const isDone   = agent.status === 'done';

          return (
            <div key={agent.id} style={{ display: 'flex', gap: 16, marginBottom: idx < agents.length - 1 ? 0 : 0 }}>

              {/* Dot + line */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 20, flexShrink: 0 }}>
                <div style={{
                  width: 12, height: 12, borderRadius: '50%', flexShrink: 0,
                  background: isActive ? accent.color : isDone ? '#4ade80' : '#1e293b',
                  border: `2px solid ${isActive ? accent.color : isDone ? '#4ade80' : '#334155'}`,
                  boxShadow: isActive ? `0 0 10px ${accent.color}` : 'none',
                  transition: 'all 0.3s',
                }} />
                {idx < agents.length - 1 && (
                  <div style={{
                    width: 2, flex: 1, minHeight: 28,
                    background: isDone ? 'rgba(74,222,128,0.3)' : '#1e293b',
                    margin: '4px 0',
                    transition: 'background 0.3s',
                  }} />
                )}
              </div>

              {/* Card */}
              <div style={{
                flex: 1,
                background: isActive ? '#131a2e' : isDone ? '#0f1520' : '#0c1018',
                border: `1px solid ${isActive ? accent.border : isDone ? '#1e3a2f' : '#1e293b'}`,
                borderLeft: isActive ? `3px solid ${accent.border}` : isDone ? '3px solid #22c55e' : '3px solid #1e293b',
                borderRadius: 12,
                padding: '14px 16px',
                marginBottom: 10,
                transition: 'all 0.3s',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <StatusIcon status={agent.status} />
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 600, color: isActive ? '#f1f5f9' : isDone ? '#cbd5e1' : '#64748b', margin: 0, marginBottom: 2 }}>
                        {agent.name}
                      </p>
                      <p style={{ fontSize: 11, color: '#475569', margin: 0 }}>{agent.role}</p>
                    </div>
                  </div>
                  <StatusBadge status={agent.status} />
                </div>

                {isActive && agent.thinkingText && (
                  <div style={{
                    marginTop: 12,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    background: accent.bg,
                    border: `1px solid ${accent.border}33`,
                    borderRadius: 8,
                    padding: '8px 12px',
                  }}>
                    <Loader2 size={11} color={accent.color} style={{ animation: 'spin 1s linear infinite', flexShrink: 0 }} />
                    <span style={{ fontSize: 12, color: accent.color, fontStyle: 'italic' }}>{agent.thinkingText}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Timeline */}
      <div style={{ borderTop: '1px solid #1e293b', padding: '16px 24px' }}>
        <p style={{ fontSize: 10, color: '#475569', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>
          Patient Journey
        </p>
        <div style={{ display: 'flex', alignItems: 'flex-start' }}>
          {JOURNEY.map((label, idx) => {
            const completed = idx < step;
            const active    = idx === step && running;
            return (
              <div key={label} style={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, minWidth: 0 }}>
                  <div style={{
                    width: 24, height: 24, borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 10, fontWeight: 700, flexShrink: 0,
                    background: completed ? '#22c55e' : active ? '#3b82f6' : '#1e293b',
                    color: completed || active ? '#fff' : '#475569',
                    border: `2px solid ${completed ? '#22c55e' : active ? '#60a5fa' : '#334155'}`,
                    boxShadow: active ? '0 0 10px rgba(59,130,246,0.5)' : 'none',
                    transition: 'all 0.3s',
                  }}>
                    {completed ? '✓' : idx + 1}
                  </div>
                  <span style={{
                    fontSize: 9, marginTop: 5, textAlign: 'center', width: '100%',
                    color: completed || active ? '#94a3b8' : '#334155',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', padding: '0 2px',
                  }}>{label}</span>
                </div>
                {idx < JOURNEY.length - 1 && (
                  <div style={{
                    height: 2, flex: 1, margin: '0 2px', marginBottom: 18,
                    background: completed ? 'rgba(34,197,94,0.4)' : '#1e293b',
                    transition: 'background 0.3s',
                  }} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
