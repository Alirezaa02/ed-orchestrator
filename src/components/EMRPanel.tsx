import { useEffect, useRef } from 'react';
import type { EMREntry, AgentOutputMap } from '../lib/types';
import { AlertTriangle } from 'lucide-react';

interface Props {
  log: EMREntry[];
  agentOutput: AgentOutputMap;
  agentColors: Record<string, string>;
  error: string | null;
  running: boolean;
}

const DOT: Record<EMREntry['type'], string> = {
  info:    'bg-slate-500',
  action:  'bg-blue-500',
  result:  'bg-green-500',
  warning: 'bg-orange-500',
};

const TEXT: Record<EMREntry['type'], string> = {
  info:    'text-slate-300',
  action:  'text-slate-400 italic',
  result:  'text-white font-medium',
  warning: 'text-orange-400',
};

function ProbBar({ label, value, color }: { label: string; value: number | null; color: string }) {
  const pct = value !== null ? Math.round(value * 100) : null;
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-slate-400">{label}</span>
        <span className="text-slate-300 font-mono">{pct !== null ? `${pct}%` : '—'}</span>
      </div>
      <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-700 ${color}`} style={{ width: pct !== null ? `${pct}%` : '0%' }} />
      </div>
    </div>
  );
}

export default function EMRPanel({ log, agentOutput, agentColors, error, running }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const outcome = agentOutput.decisionAgent;

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [log]);

  const dispColor = !outcome ? '' :
    outcome.disposition === 'Admit to Hospital' ? 'bg-red-950 border-red-800 text-red-300' :
    outcome.disposition === 'Short Stay Unit'   ? 'bg-amber-950 border-amber-800 text-amber-300' :
    'bg-green-950 border-green-800 text-green-300';

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-slate-800">
        <h2 className="font-bold text-white">EMR Live Log</h2>
        <p className="text-xs text-slate-400 mt-0.5">Real-time agent activity</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2 min-h-0">
        {log.length === 0 && !error && (
          <div className="text-center py-10">
            <p className="text-xs text-slate-600">No activity yet.</p>
            <p className="text-xs text-slate-700 mt-1">Start a simulation to see live logs.</p>
          </div>
        )}
        {log.map(entry => (
          <div key={entry.id} className="flex gap-2 text-xs">
            <div className="mt-1.5 flex-shrink-0"><div className={`w-1.5 h-1.5 rounded-full ${DOT[entry.type]}`} /></div>
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline gap-1.5 flex-wrap">
                <span className="text-slate-600 font-mono text-[10px]">{entry.ts}</span>
                <span className={`font-semibold text-[10px] ${agentColors[entry.agentId] ?? 'text-slate-400'}`}>{entry.agent}</span>
              </div>
              <p className={`mt-0.5 leading-relaxed ${TEXT[entry.type]}`}>{entry.message}</p>
            </div>
          </div>
        ))}
        {error && (
          <div className="flex gap-2 items-start p-3 bg-red-950 border border-red-800 rounded-lg text-xs text-red-300">
            <AlertTriangle size={12} className="mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold">Error</p>
              <p className="mt-0.5 text-red-400">{error}</p>
              {error.includes('fetch') && (
                <p className="mt-1 text-red-500">Make sure n8n is running on <code className="bg-red-900 px-1 rounded">localhost:5678</code></p>
              )}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="border-t border-slate-800 p-4 flex-shrink-0">
        <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-3">Predicted Outcome</p>
        {outcome ? (
          <div className="space-y-2">
            <div className={`p-3 rounded-lg border ${dispColor}`}>
              <p className="text-sm font-bold">{outcome.disposition}</p>
              <p className="text-xs text-slate-400 mt-0.5">{Math.round(outcome.confidence * 100)}% confidence</p>
            </div>
            <ProbBar label="Admit to Hospital" value={outcome.probabilities.admit}     color="bg-red-500" />
            <ProbBar label="Short Stay Unit"   value={outcome.probabilities.shortStay} color="bg-amber-500" />
            <ProbBar label="Discharge Home"    value={outcome.probabilities.discharge} color="bg-green-500" />
            {outcome.rationale && <p className="text-[10px] text-slate-500 leading-relaxed mt-1">{outcome.rationale}</p>}
          </div>
        ) : (
          <div className="space-y-2">
            <ProbBar label="Admit to Hospital" value={running ? null : 0} color="bg-red-500" />
            <ProbBar label="Short Stay Unit"   value={running ? null : 0} color="bg-amber-500" />
            <ProbBar label="Discharge Home"    value={running ? null : 0} color="bg-green-500" />
          </div>
        )}
      </div>
    </div>
  );
}
