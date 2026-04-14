import type { AgentState } from '../lib/types';
import { CheckCircle2, Clock, Loader2, Circle } from 'lucide-react';

interface Props {
  agents: AgentState[];
  step: number;
  running: boolean;
}

const COLORS = {
  patientAgent:  { dot: 'bg-blue-500',   ring: 'ring-blue-400',   badge: 'bg-blue-500/20 text-blue-300',    border: 'border-l-blue-500' },
  triageAgent:   { dot: 'bg-purple-500', ring: 'ring-purple-400', badge: 'bg-purple-500/20 text-purple-300', border: 'border-l-purple-500' },
  nurseAgent:    { dot: 'bg-green-500',  ring: 'ring-green-400',  badge: 'bg-green-500/20 text-green-300',   border: 'border-l-green-500' },
  doctorAgent:   { dot: 'bg-amber-500',  ring: 'ring-amber-400',  badge: 'bg-amber-500/20 text-amber-300',   border: 'border-l-amber-500' },
  decisionAgent: { dot: 'bg-red-500',    ring: 'ring-red-400',    badge: 'bg-red-500/20 text-red-300',       border: 'border-l-red-500' },
} as const;

const JOURNEY = ['Arrival', 'Registration', 'Triage', 'Nurse', 'Doctor', 'Disposition'];

const STATUS_BADGE: Record<AgentState['status'], string> = {
  done:    'bg-green-500/20 text-green-300',
  active:  'bg-blue-500/20 text-blue-300',
  pending: 'bg-amber-500/20 text-amber-300',
  waiting: 'bg-slate-700 text-slate-500',
};

function StatusIcon({ status }: { status: AgentState['status'] }) {
  if (status === 'done')    return <CheckCircle2 size={15} className="text-green-400 flex-shrink-0" />;
  if (status === 'active')  return <Loader2     size={15} className="text-blue-400 animate-spin flex-shrink-0" />;
  if (status === 'pending') return <Clock       size={15} className="text-amber-400 flex-shrink-0" />;
  return <Circle size={15} className="text-slate-600 flex-shrink-0" />;
}

export default function PipelinePanel({ agents, step, running }: Props) {
  const done = agents.filter(a => a.status === 'done').length;

  return (
    <div className="flex flex-col h-full">
      <div className="p-5 border-b border-slate-800 flex items-center justify-between">
        <div>
          <h2 className="font-bold text-white">Agent Pipeline — live</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {running ? `Active agents: ${done + 1}/5` : done > 0 ? `Completed — ${done}/5 agents ran` : 'Ready to run'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {running && <div className="flex items-center gap-1.5 text-xs text-blue-400"><Loader2 size={11} className="animate-spin" />Processing</div>}
          <span className="text-xs bg-slate-800 text-slate-400 px-2 py-1 rounded">Step {Math.min(step + 1, 6)} of 6</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-3">
        {agents.map((agent, idx) => {
          const c = COLORS[agent.id as keyof typeof COLORS];
          const isActive = agent.status === 'active';
          return (
            <div key={agent.id} className="flex gap-3 items-start">
              <div className="flex flex-col items-center mt-1 flex-shrink-0">
                <div className={`w-3 h-3 rounded-full transition-all ${
                  isActive           ? `${c.dot} ring-2 ring-offset-1 ring-offset-[#0f1117] ${c.ring} ring-opacity-60` :
                  agent.status === 'done' ? 'bg-green-500' : 'bg-slate-700'
                }`} />
                {idx < agents.length - 1 && (
                  <div className={`w-0.5 h-8 mt-1 ${agent.status === 'done' ? 'bg-green-500/40' : 'bg-slate-800'}`} />
                )}
              </div>
              <div className={`flex-1 rounded-xl p-4 border transition-all duration-300 ${
                isActive
                  ? `bg-slate-800/90 border border-l-2 ${c.border} border-slate-700 shadow-lg`
                  : agent.status === 'done' ? 'bg-slate-800/40 border-slate-700'
                  : 'bg-slate-900/40 border-slate-800'
              }`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <StatusIcon status={agent.status} />
                    <div>
                      <p className="text-sm font-semibold text-white">{agent.name}</p>
                      <p className="text-xs text-slate-500">{agent.role}</p>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${STATUS_BADGE[agent.status]}`}>
                    {agent.status.charAt(0).toUpperCase() + agent.status.slice(1)}
                  </span>
                </div>
                {isActive && agent.thinkingText && (
                  <div className={`mt-3 flex items-center gap-2 text-xs px-3 py-2 rounded-lg ${c.badge}`}>
                    <Loader2 size={10} className="animate-spin flex-shrink-0" />
                    <span className="italic">{agent.thinkingText}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="border-t border-slate-800 p-4">
        <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-3">Patient Journey</p>
        <div className="flex items-start">
          {JOURNEY.map((label, idx) => {
            const completed = idx < step;
            const active = idx === step && running;
            return (
              <div key={label} className="flex items-center flex-1 min-w-0">
                <div className="flex flex-col items-center flex-1 min-w-0">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 transition-all ${
                    completed ? 'bg-green-500 text-white' :
                    active    ? 'bg-blue-500 text-white ring-2 ring-blue-400/40' :
                    'bg-slate-800 text-slate-500'
                  }`}>{completed ? '✓' : idx + 1}</div>
                  <span className={`text-[9px] mt-1 text-center leading-tight w-full px-0.5 truncate ${completed || active ? 'text-slate-300' : 'text-slate-600'}`}>{label}</span>
                </div>
                {idx < JOURNEY.length - 1 && (
                  <div className={`h-0.5 flex-1 mx-0.5 mb-4 ${completed ? 'bg-green-500/40' : 'bg-slate-800'}`} />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
