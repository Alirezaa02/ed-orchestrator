import { useState } from 'react';
import type { SimulationRun } from '../lib/types';
import { BarChart3 } from 'lucide-react';

function Bar({ label, count, total, color }: { label: string; count: number; total: number; color: string }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
        <span style={{ fontSize: 12, color: '#94a3b8' }}>{label}</span>
        <span style={{ fontSize: 12, color: '#e2e8f0', fontFamily: 'monospace', fontWeight: 600 }}>{count} ({pct}%)</span>
      </div>
      <div style={{ height: 6, background: '#1e293b', borderRadius: 4, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 4, transition: 'width 0.6s ease' }} />
      </div>
    </div>
  );
}

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div style={{ background: '#0f1520', border: '1px solid #1e293b', borderRadius: 10, padding: '14px 16px', flex: 1 }}>
      <p style={{ fontSize: 11, color: '#475569', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 6px' }}>{label}</p>
      <p style={{ fontSize: 26, fontWeight: 700, color: '#f1f5f9', margin: 0, lineHeight: 1 }}>{value}</p>
      {sub && <p style={{ fontSize: 11, color: '#64748b', margin: '4px 0 0' }}>{sub}</p>}
    </div>
  );
}

export default function AnalyticsPanel() {
  const [history, setHistory] = useState<SimulationRun[]>(() => {
    try { return JSON.parse(localStorage.getItem('sim_history') || '[]'); } catch { return []; }
  });

  const total = history.length;
  const admit    = history.filter(r => r.disposition === 'Admit to Hospital').length;
  const shortStay = history.filter(r => r.disposition === 'Short Stay Unit').length;
  const discharge = history.filter(r => r.disposition === 'Discharge Home').length;
  const avgCat = total > 0
    ? (history.reduce((s, r) => s + r.triageCategory, 0) / total).toFixed(1)
    : '—';

  const clearHistory = () => {
    localStorage.removeItem('sim_history');
    setHistory([]);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#0a0d14' }}>
      <div style={{ padding: '20px 24px', borderBottom: '1px solid #1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#f1f5f9', margin: 0, marginBottom: 4 }}>Analytics</h2>
          <p style={{ fontSize: 12, color: '#64748b', margin: 0 }}>Simulation history &amp; outcomes</p>
        </div>
        {total > 0 && (
          <button onClick={clearHistory} style={{ fontSize: 11, color: '#475569', background: 'transparent', border: '1px solid #1e293b', borderRadius: 6, padding: '5px 10px', cursor: 'pointer' }}>
            Clear History
          </button>
        )}
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
        {total === 0 ? (
          <div style={{ textAlign: 'center', paddingTop: 60 }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
              <BarChart3 size={22} color="#475569" />
            </div>
            <p style={{ fontSize: 13, color: '#475569', margin: 0 }}>No simulations yet</p>
            <p style={{ fontSize: 12, color: '#334155', margin: '6px 0 0' }}>Run simulations to see analytics here</p>
          </div>
        ) : (
          <>
            {/* Stat cards */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
              <StatCard label="Total Runs"   value={total} />
              <StatCard label="Avg Triage"   value={avgCat} sub="CAT scale (1–5)" />
            </div>

            {/* Disposition breakdown */}
            <div style={{ background: '#0c1018', border: '1px solid #1e293b', borderRadius: 12, padding: '16px 18px', marginBottom: 24 }}>
              <p style={{ fontSize: 10, fontWeight: 600, color: '#475569', letterSpacing: '0.1em', textTransform: 'uppercase', margin: '0 0 14px' }}>
                Disposition Breakdown
              </p>
              <Bar label="Admit to Hospital" count={admit}    total={total} color="#ef4444" />
              <Bar label="Short Stay Unit"   count={shortStay} total={total} color="#f59e0b" />
              <Bar label="Discharge Home"    count={discharge} total={total} color="#22c55e" />
            </div>

            {/* Recent runs */}
            <div>
              <p style={{ fontSize: 10, fontWeight: 600, color: '#475569', letterSpacing: '0.1em', textTransform: 'uppercase', margin: '0 0 12px' }}>
                Recent Simulations
              </p>
              {[...history].reverse().slice(0, 10).map(run => {
                const dispColor = run.disposition === 'Admit to Hospital' ? '#f87171' : run.disposition === 'Short Stay Unit' ? '#fbbf24' : '#4ade80';
                return (
                  <div key={run.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #1e293b' }}>
                    <div>
                      <p style={{ fontSize: 12, color: '#e2e8f0', margin: 0, fontWeight: 500 }}>{run.patientName}</p>
                      <p style={{ fontSize: 10, color: '#475569', margin: '2px 0 0' }}>{new Date(run.timestamp).toLocaleString('en-AU', { dateStyle: 'short', timeStyle: 'short' })}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: 10, fontWeight: 600, color: dispColor }}>{run.disposition}</span>
                      <p style={{ fontSize: 10, color: '#475569', margin: '2px 0 0' }}>CAT {run.triageCategory}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
