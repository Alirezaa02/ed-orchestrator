import type { PatientInput, AgentOutputMap } from '../lib/types';
import { Activity, Users, BarChart3, Settings, Play, Square } from 'lucide-react';

interface Props {
  patient: PatientInput | null;
  agentOutput: AgentOutputMap;
  running: boolean;
  onNewSimulation: () => void;
  onStop: () => void;
}

const CAT_STYLES: Record<number, { bg: string; text: string; label: string }> = {
  1: { bg: 'bg-red-600',    text: 'text-white', label: 'RESUSCITATION' },
  2: { bg: 'bg-orange-500', text: 'text-white', label: 'EMERGENCY' },
  3: { bg: 'bg-yellow-500', text: 'text-black', label: 'URGENT' },
  4: { bg: 'bg-green-600',  text: 'text-white', label: 'SEMI-URGENT' },
  5: { bg: 'bg-blue-600',   text: 'text-white', label: 'NON-URGENT' },
};

function VitalBox({ label, value, unit, warn }: { label: string; value: string | number; unit: string; warn: boolean }) {
  return (
    <div className={`flex flex-col items-center p-2 rounded-lg ${warn ? 'bg-orange-950 border border-orange-700' : 'bg-slate-800'}`}>
      <span className={`text-base font-bold leading-none ${warn ? 'text-orange-400' : 'text-white'}`}>
        {value}<span className="text-[10px] font-normal ml-0.5">{unit}</span>
      </span>
      <span className="text-[10px] text-slate-400 mt-1">{label}</span>
    </div>
  );
}

export default function PatientPanel({ patient, agentOutput, running, onNewSimulation, onStop }: Props) {
  const triage = agentOutput.triageAgent;
  const cat = triage ? CAT_STYLES[triage.category] : null;

  const warn = patient ? {
    hr:   patient.hr > 100 || patient.hr < 60,
    sbp:  patient.sbp > 160 || patient.sbp < 100,
    spo2: patient.spo2 < 95,
    temp: patient.temp > 38 || patient.temp < 36,
    rr:   patient.rr > 20 || patient.rr < 12,
  } : { hr: false, sbp: false, spo2: false, temp: false, rr: false };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-slate-800">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Royal North Shore ED</span>
        </div>
        <h1 className="text-sm font-bold text-white">ED Orchestrator AI</h1>
      </div>

      <div className="p-4 border-b border-slate-800 flex-shrink-0">
        {patient ? (
          <>
            <div className="flex items-start justify-between mb-2">
              <div className="min-w-0">
                <p className="font-bold text-white text-sm truncate">{patient.name}</p>
                <p className="text-xs text-slate-400">{patient.age}{patient.sex} · {patient.arrivalMode}</p>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">{patient.chiefComplaint}</p>
              </div>
              {cat && (
                <span className={`text-xs font-bold px-2 py-0.5 rounded ml-2 flex-shrink-0 ${cat.bg} ${cat.text}`}>
                  CAT {triage?.category}
                </span>
              )}
            </div>
            {cat && (
              <div className={`text-xs font-bold text-center py-1 rounded mb-3 ${cat.bg} ${cat.text}`}>{cat.label}</div>
            )}
            <div className="grid grid-cols-3 gap-1.5">
              <VitalBox label="HR"   value={patient.hr}                        unit="bpm"  warn={warn.hr} />
              <VitalBox label="BP"   value={`${patient.sbp}/${patient.dbp}`}   unit=""     warn={warn.sbp} />
              <VitalBox label="SpO2" value={patient.spo2}                      unit="%"    warn={warn.spo2} />
              <VitalBox label="Temp" value={patient.temp}                      unit="°C"   warn={warn.temp} />
              <VitalBox label="RR"   value={patient.rr}                        unit="/min" warn={warn.rr} />
            </div>
          </>
        ) : (
          <div className="text-center py-6">
            <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-2">
              <Users size={18} className="text-slate-500" />
            </div>
            <p className="text-xs text-slate-500">No active patient</p>
            <p className="text-xs text-slate-600 mt-0.5">Run a simulation to begin</p>
          </div>
        )}
      </div>

      <nav className="p-4 space-y-1 flex-1">
        {[
          { icon: <Activity size={14} />, label: 'Agent Pipeline', active: true },
          { icon: <Users size={14} />,    label: 'Patient Flow' },
          { icon: <BarChart3 size={14} />,label: 'Analytics' },
          { icon: <Settings size={14} />, label: 'Settings' },
        ].map(({ icon, label, active }) => (
          <button key={label} className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-colors ${active ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'}`}>
            {icon}{label}
          </button>
        ))}
      </nav>

      <div className="p-4">
        {running ? (
          <button onClick={onStop} className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-700 hover:bg-red-600 text-white text-sm font-semibold transition-colors">
            <Square size={13} />Stop Simulation
          </button>
        ) : (
          <button onClick={onNewSimulation} className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-colors">
            <Play size={13} />Run New Simulation
          </button>
        )}
      </div>
    </div>
  );
}
