import { useState, useRef, useCallback } from 'react';
import type { PatientInput, AgentState, EMREntry, AgentOutputMap } from '../lib/types';
import { DEMO_PATIENTS } from '../lib/patients';
import { runSimulation } from '../lib/api';
import PatientPanel from './PatientPanel';
import PipelinePanel from './PipelinePanel';
import EMRPanel from './EMRPanel';
import NewSimulationModal from './NewSimulationModal';

const AGENT_DEFS: AgentState[] = [
  { id: 'patientAgent',  name: 'Patient Agent',  role: 'Demographics & complaint collection', status: 'waiting' },
  { id: 'triageAgent',   name: 'Triage Agent',   role: 'ATS category assignment',             status: 'waiting' },
  { id: 'nurseAgent',    name: 'Nurse Agent',     role: 'Vitals, orders & labs',               status: 'waiting' },
  { id: 'doctorAgent',   name: 'Doctor Agent',    role: 'Labs review & clinical reasoning',    status: 'waiting' },
  { id: 'decisionAgent', name: 'Decision Agent',  role: 'Final disposition',                   status: 'waiting' },
];

const THINKING: Record<string, string[]> = {
  patientAgent:  ['Collecting patient demographics...', 'Recording chief complaint...', 'Confirming arrival details...'],
  triageAgent:   ['Analysing symptom severity...', 'Reviewing vital signs pattern...', 'Assigning ATS category...'],
  nurseAgent:    ['Assessing vital signs...', 'Flagging abnormal values...', 'Placing nursing orders...', 'Requesting lab panels...'],
  doctorAgent:   ['Reviewing nursing assessment...', 'Forming differential diagnosis...', 'Building clinical picture...'],
  decisionAgent: ['Synthesising all findings...', 'Calculating disposition probability...', 'Preparing final recommendation...'],
};

const AGENT_COLORS: Record<string, string> = {
  patientAgent:  '#60a5fa',
  triageAgent:   '#c084fc',
  nurseAgent:    '#4ade80',
  doctorAgent:   '#fbbf24',
  decisionAgent: '#f87171',
};

let _id = 0;
const uid = () => String(++_id);
const ts  = () => new Date().toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

export default function Dashboard() {
  const [patient,     setPatient]     = useState<PatientInput | null>(null);
  const [agents,      setAgents]      = useState<AgentState[]>(AGENT_DEFS.map(a => ({ ...a })));
  const [emrLog,      setEmrLog]      = useState<EMREntry[]>([]);
  const [agentOutput, setAgentOutput] = useState<AgentOutputMap>({});
  const [running,     setRunning]     = useState(false);
  const [showModal,   setShowModal]   = useState(false);
  const [step,        setStep]        = useState(0);
  const [error,       setError]       = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const addLog = useCallback((agentId: keyof AgentOutputMap, message: string, type: EMREntry['type'] = 'info') => {
    const agent = AGENT_DEFS.find(a => a.id === agentId)?.name ?? agentId;
    setEmrLog(prev => [...prev, { id: uid(), ts: ts(), agent, agentId, message, type }]);
  }, []);

  const reset = () => {
    setAgents(AGENT_DEFS.map(a => ({ ...a, status: 'waiting' as const, thinkingText: undefined })));
    setEmrLog([]);
    setAgentOutput({});
    setStep(0);
    setError(null);
  };

  const animateAgent = async (idx: number, agentId: keyof AgentOutputMap) => {
    setAgents(prev => prev.map((a, i) =>
      i === idx ? { ...a, status: 'active' as const, thinkingText: 'Starting...' } : a
    ));
    addLog(agentId, `${AGENT_DEFS[idx].name} activated`, 'info');

    for (const text of THINKING[agentId] ?? ['Processing...']) {
      setAgents(prev => prev.map(a => a.id === agentId ? { ...a, thinkingText: text } : a));
      addLog(agentId, text, 'action');
      await delay(700);
    }
  };

  const completeAgent = (idx: number, agentId: keyof AgentOutputMap, output: AgentOutputMap) => {
    const summary = getSummary(agentId, output);
    setAgents(prev => prev.map((a, i) => {
      if (i === idx)     return { ...a, status: 'done' as const, thinkingText: undefined };
      if (i === idx + 1) return { ...a, status: 'pending' as const };
      return a;
    }));
    setStep(idx + 1);
    if (summary) addLog(agentId, summary, 'result');
  };

  const runSim = async (p: PatientInput) => {
    setPatient(p);
    reset();
    setRunning(true);
    animateAgent(0, 'patientAgent');

    try {
      const result = await runSimulation(p);
      const ids = ['patientAgent', 'triageAgent', 'nurseAgent', 'doctorAgent', 'decisionAgent'] as (keyof AgentOutputMap)[];

      for (let i = 0; i < ids.length; i++) {
        const agentId = ids[i];
        if (i > 0) { await animateAgent(i, agentId); await delay(300); }
        setAgentOutput(prev => {
          const updated = { ...prev, [agentId]: result[agentId] };
          completeAgent(i, agentId, updated);
          return updated;
        });
        await delay(500);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setAgents(prev => prev.map(a => a.status === 'active' ? { ...a, status: 'waiting' as const, thinkingText: undefined } : a));
    } finally {
      setRunning(false);
    }
  };

  const stopSim = () => {
    abortRef.current?.abort();
    setRunning(false);
    setAgents(prev => prev.map(a => a.status === 'active' ? { ...a, status: 'waiting' as const, thinkingText: undefined } : a));
  };

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#0a0d14', overflow: 'hidden' }}>

      {/* Left — Patient Panel */}
      <div style={{ width: 280, flexShrink: 0, borderRight: '1px solid #1e293b', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
        <PatientPanel
          patient={patient}
          agentOutput={agentOutput}
          running={running}
          onNewSimulation={() => setShowModal(true)}
          onStop={stopSim}
        />
      </div>

      {/* Centre — Pipeline */}
      <div style={{ flex: 1, minWidth: 0, borderRight: '1px solid #1e293b', display: 'flex', flexDirection: 'column' }}>
        <PipelinePanel agents={agents} step={step} running={running} />
      </div>

      {/* Right — EMR */}
      <div style={{ width: 320, flexShrink: 0, display: 'flex', flexDirection: 'column' }}>
        <EMRPanel
          log={emrLog}
          agentOutput={agentOutput}
          agentColors={AGENT_COLORS}
          error={error}
          running={running}
        />
      </div>

      {showModal && (
        <NewSimulationModal
          demoPatients={DEMO_PATIENTS}
          onStart={p => { setShowModal(false); runSim(p); }}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}

function delay(ms: number) { return new Promise(r => setTimeout(r, ms)); }

function getSummary(agentId: keyof AgentOutputMap, output: AgentOutputMap): string {
  switch (agentId) {
    case 'patientAgent':  return output.patientAgent?.summary ?? '';
    case 'triageAgent':   return `CAT ${output.triageAgent?.category} — ${output.triageAgent?.categoryName}. ${output.triageAgent?.reasoning ?? ''}`;
    case 'nurseAgent':    return `${output.nurseAgent?.abnormalFlags?.length ?? 0} abnormal flag(s). Orders: ${output.nurseAgent?.ordersPlaced?.join(', ')}`;
    case 'doctorAgent':   return `Primary: ${output.doctorAgent?.differentialDiagnosis?.[0]}. ${output.doctorAgent?.reasoning ?? ''}`;
    case 'decisionAgent': return `Disposition: ${output.decisionAgent?.disposition} (${Math.round((output.decisionAgent?.confidence ?? 0) * 100)}% confidence). ${output.decisionAgent?.rationale ?? ''}`;
    default: return '';
  }
}
