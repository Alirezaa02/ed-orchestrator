import { useState } from 'react';
import type { PatientInput, ArrivalMode } from '../lib/types';
import { X, Zap } from 'lucide-react';

interface Props {
  demoPatients: PatientInput[];
  onStart: (p: PatientInput) => void;
  onClose: () => void;
}

const DEMO_TAGS = ['CAT 2 — Chest Pain', 'CAT 3 — Meningitis', 'CAT 5 — Cold'];
const ARRIVAL_MODES: ArrivalMode[] = ['Walk-in', 'Ambulance', 'GP Referral', 'Self-referral'];

const BLANK: PatientInput = {
  name: '', age: 35, sex: 'M', arrivalMode: 'Walk-in', chiefComplaint: '',
  hr: 80, rr: 16, sbp: 120, dbp: 80, temp: 37.0, spo2: 98,
  pmhx: 'Nil', meds: 'Nil', allergies: 'Nil known',
};

export default function NewSimulationModal({ demoPatients, onStart, onClose }: Props) {
  const [tab, setTab] = useState<'demo' | 'custom'>('demo');
  const [selected, setSelected] = useState(0);
  const [form, setForm] = useState<PatientInput>(BLANK);

  const set = <K extends keyof PatientInput>(k: K, v: PatientInput[K]) =>
    setForm(p => ({ ...p, [k]: v }));

  const handleStart = () => {
    if (tab === 'demo') { onStart(demoPatients[selected]); return; }
    if (!form.name.trim() || !form.chiefComplaint.trim()) { alert('Please enter patient name and chief complaint.'); return; }
    onStart(form);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg mx-4 shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
          <div>
            <h2 className="text-sm font-bold text-white">New Simulation</h2>
            <p className="text-xs text-slate-400 mt-0.5">Select a patient to run through the ED pipeline</p>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors"><X size={17} /></button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-700">
          {(['demo', 'custom'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 py-2.5 text-xs font-medium capitalize transition-colors ${tab === t ? 'text-white border-b-2 border-blue-500' : 'text-slate-500 hover:text-slate-300'}`}>
              {t === 'demo' ? 'Demo Patients' : 'Custom Patient'}
            </button>
          ))}
        </div>

        <div className="p-5 max-h-[60vh] overflow-y-auto">
          {tab === 'demo' ? (
            <div className="space-y-3">
              {demoPatients.map((p, i) => (
                <button key={i} onClick={() => setSelected(i)}
                  className={`w-full text-left p-4 rounded-xl border transition-all ${selected === i ? 'border-blue-500 bg-blue-500/10' : 'border-slate-700 bg-slate-800/50 hover:border-slate-500'}`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-semibold text-white">{p.name}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{p.age}{p.sex} · {p.arrivalMode}</p>
                      <p className="text-xs text-slate-300 mt-1">{p.chiefComplaint}</p>
                    </div>
                    <span className="text-xs text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded ml-2 flex-shrink-0">{DEMO_TAGS[i].split(' — ')[0]}</span>
                  </div>
                  <div className="flex gap-3 mt-2 text-xs text-slate-500">
                    <span>HR {p.hr}</span><span>BP {p.sbp}/{p.dbp}</span><span>SpO2 {p.spo2}%</span><span>{p.temp}°C</span>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              <Row2>
                <F label="Full Name"><input className="input-field" value={form.name} onChange={e => set('name', e.target.value)} placeholder="John Smith" /></F>
                <F label="Age"><input type="number" className="input-field" value={form.age} onChange={e => set('age', +e.target.value)} /></F>
              </Row2>
              <Row2>
                <F label="Sex">
                  <select className="input-field" value={form.sex} onChange={e => set('sex', e.target.value as 'M' | 'F')}>
                    <option value="M">Male</option><option value="F">Female</option>
                  </select>
                </F>
                <F label="Arrival Mode">
                  <select className="input-field" value={form.arrivalMode} onChange={e => set('arrivalMode', e.target.value as ArrivalMode)}>
                    {ARRIVAL_MODES.map(m => <option key={m}>{m}</option>)}
                  </select>
                </F>
              </Row2>
              <F label="Chief Complaint">
                <textarea className="input-field resize-none" rows={2} value={form.chiefComplaint} onChange={e => set('chiefComplaint', e.target.value)} placeholder="Describe the presenting complaint..." />
              </F>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider pt-1">Vitals</p>
              <div className="grid grid-cols-3 gap-2">
                <F label="HR (bpm)"><input type="number" className="input-field" value={form.hr} onChange={e => set('hr', +e.target.value)} /></F>
                <F label="RR (/min)"><input type="number" className="input-field" value={form.rr} onChange={e => set('rr', +e.target.value)} /></F>
                <F label="SBP"><input type="number" className="input-field" value={form.sbp} onChange={e => set('sbp', +e.target.value)} /></F>
                <F label="DBP"><input type="number" className="input-field" value={form.dbp} onChange={e => set('dbp', +e.target.value)} /></F>
                <F label="Temp (°C)"><input type="number" step="0.1" className="input-field" value={form.temp} onChange={e => set('temp', +e.target.value)} /></F>
                <F label="SpO2 (%)"><input type="number" className="input-field" value={form.spo2} onChange={e => set('spo2', +e.target.value)} /></F>
              </div>
              <F label="Past Medical History"><input className="input-field" value={form.pmhx} onChange={e => set('pmhx', e.target.value)} placeholder="Nil / list conditions" /></F>
              <Row2>
                <F label="Medications"><input className="input-field" value={form.meds} onChange={e => set('meds', e.target.value)} placeholder="Nil" /></F>
                <F label="Allergies"><input className="input-field" value={form.allergies} onChange={e => set('allergies', e.target.value)} placeholder="Nil known" /></F>
              </Row2>
            </div>
          )}
        </div>

        <div className="px-5 py-4 border-t border-slate-700 flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-slate-600 text-slate-300 text-xs hover:bg-slate-800 transition-colors">Cancel</button>
          <button onClick={handleStart} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors">
            <Zap size={13} />Start Simulation
          </button>
        </div>
      </div>
    </div>
  );
}

function Row2({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 gap-2">{children}</div>;
}
function F({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className="block text-xs text-slate-400 mb-1">{label}</label>{children}</div>;
}
