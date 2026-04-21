import React from 'react';
import type { PatientInput, AgentOutputMap, ActiveView } from '../lib/types';
import { Activity, Users, BarChart3, Settings, Play, Square } from 'lucide-react';

interface Props {
  patient: PatientInput | null;
  agentOutput: AgentOutputMap;
  running: boolean;
  activeView: ActiveView;
  onNewSimulation: () => void;
  onStop: () => void;
  onNav: (view: ActiveView) => void;
}

const CAT_STYLES: Record<number, { bg: string; border: string; text: string; label: string }> = {
  1: { bg: '#7f1d1d', border: '#ef4444', text: '#fca5a5', label: 'RESUSCITATION' },
  2: { bg: '#7c2d12', border: '#f97316', text: '#fdba74', label: 'EMERGENCY' },
  3: { bg: '#713f12', border: '#eab308', text: '#fde047', label: 'URGENT' },
  4: { bg: '#14532d', border: '#22c55e', text: '#86efac', label: 'SEMI-URGENT' },
  5: { bg: '#1e3a5f', border: '#3b82f6', text: '#93c5fd', label: 'NON-URGENT' },
};

function VitalBox({ label, value, unit, warn }: { label: string; value: string | number; unit: string; warn: boolean }) {
  return (
    <div style={{
      background: warn ? '#431407' : '#1e293b',
      border: `1px solid ${warn ? '#c2410c' : '#334155'}`,
      borderRadius: 10,
      padding: '10px 6px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 3,
    }}>
      <span style={{ fontSize: 18, fontWeight: 700, color: warn ? '#fb923c' : '#f1f5f9', lineHeight: 1 }}>
        {value}
        <span style={{ fontSize: 10, fontWeight: 400, marginLeft: 2, color: warn ? '#fdba74' : '#94a3b8' }}>{unit}</span>
      </span>
      <span style={{ fontSize: 10, color: '#64748b', fontWeight: 500 }}>{label}</span>
    </div>
  );
}

const NAV: { icon: React.ReactElement; label: string; view: ActiveView }[] = [
  { icon: <Activity size={15} />, label: 'Agent Pipeline', view: 'pipeline' },
  { icon: <Users size={15} />,    label: 'Patient Flow',   view: 'patientFlow' },
  { icon: <BarChart3 size={15} />,label: 'Analytics',      view: 'analytics' },
  { icon: <Settings size={15} />, label: 'Settings',       view: 'settings' },
];

export default function PatientPanel({ patient, agentOutput, running, activeView, onNewSimulation, onStop, onNav }: Props) {
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
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#0f1117' }}>

      {/* Header */}
      <div style={{ padding: '16px 20px', borderBottom: '1px solid #1e293b' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444', boxShadow: '0 0 6px #ef4444' }} />
          <span style={{ fontSize: 10, fontWeight: 600, color: '#475569', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            Royal North Shore ED
          </span>
        </div>
        <h1 style={{ fontSize: 15, fontWeight: 700, color: '#f1f5f9', margin: 0 }}>ED Orchestrator AI</h1>
      </div>

      {/* Patient Card */}
      <div style={{ padding: '16px 20px', borderBottom: '1px solid #1e293b' }}>
        {patient ? (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10, gap: 10 }}>
              <div style={{ minWidth: 0 }}>
                <p style={{ fontWeight: 700, color: '#f1f5f9', fontSize: 15, margin: 0, marginBottom: 3 }}>{patient.name}</p>
                <p style={{ fontSize: 12, color: '#64748b', margin: 0, marginBottom: 6 }}>{patient.age}{patient.sex} · {patient.arrivalMode}</p>
                <p style={{ fontSize: 12, color: '#94a3b8', margin: 0, lineHeight: 1.5 }}>{patient.chiefComplaint}</p>
              </div>
              {cat && (
                <div style={{
                  background: cat.bg,
                  border: `1px solid ${cat.border}`,
                  borderRadius: 8,
                  padding: '4px 10px',
                  flexShrink: 0,
                }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: cat.text }}>CAT {triage?.category}</span>
                </div>
              )}
            </div>

            {cat && (
              <div style={{
                background: cat.bg,
                border: `1px solid ${cat.border}`,
                borderRadius: 8,
                padding: '6px 12px',
                textAlign: 'center',
                marginBottom: 12,
              }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: cat.text, letterSpacing: '0.05em' }}>{cat.label}</span>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
              <VitalBox label="HR"   value={patient.hr}                      unit="bpm"  warn={warn.hr} />
              <VitalBox label="BP"   value={`${patient.sbp}/${patient.dbp}`} unit=""     warn={warn.sbp} />
              <VitalBox label="SpO2" value={patient.spo2}                    unit="%"    warn={warn.spo2} />
              <VitalBox label="Temp" value={patient.temp}                    unit="°C"   warn={warn.temp} />
              <VitalBox label="RR"   value={patient.rr}                      unit="/min" warn={warn.rr} />
            </div>
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px' }}>
              <Users size={20} color="#475569" />
            </div>
            <p style={{ fontSize: 13, color: '#475569', margin: 0 }}>No active patient</p>
            <p style={{ fontSize: 12, color: '#334155', margin: '4px 0 0' }}>Run a simulation to begin</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav style={{ padding: '12px 12px', flex: 1 }}>
        {NAV.map(({ icon, label, view }) => {
          const active = activeView === view;
          return (
            <button key={view} onClick={() => onNav(view)} style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '9px 12px',
              borderRadius: 8,
              border: 'none',
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: active ? 600 : 400,
              color: active ? '#f1f5f9' : '#64748b',
              background: active ? '#1e293b' : 'transparent',
              marginBottom: 2,
              textAlign: 'left',
              transition: 'all 0.15s',
            }}>
              {icon}{label}
            </button>
          );
        })}
      </nav>

      {/* CTA */}
      <div style={{ padding: '16px 20px' }}>
        {running ? (
          <button onClick={onStop} style={{
            width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: 8, padding: '12px', borderRadius: 12, border: 'none', cursor: 'pointer',
            background: '#991b1b', color: '#fff', fontSize: 14, fontWeight: 600,
          }}>
            <Square size={14} />Stop Simulation
          </button>
        ) : (
          <button onClick={onNewSimulation} style={{
            width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: 8, padding: '12px', borderRadius: 12, border: 'none', cursor: 'pointer',
            background: '#2563eb', color: '#fff', fontSize: 14, fontWeight: 600,
          }}>
            <Play size={14} />Run New Simulation
          </button>
        )}
      </div>
    </div>
  );
}
