import type { AgentOutputMap, PatientInput } from '../lib/types';
import { Users } from 'lucide-react';

interface Props {
  agentOutput: AgentOutputMap;
  patient: PatientInput | null;
}

const AGENTS = [
  { id: 'patientAgent'  as const, name: 'Register Agent', color: '#60a5fa', bg: 'rgba(59,130,246,0.08)',  border: '#3b82f6' },
  { id: 'triageAgent'   as const, name: 'Triage Agent',   color: '#c084fc', bg: 'rgba(168,85,247,0.08)', border: '#a855f7' },
  { id: 'nurseAgent'    as const, name: 'Nurse Agent',    color: '#4ade80', bg: 'rgba(34,197,94,0.08)',  border: '#22c55e' },
  { id: 'doctorAgent'   as const, name: 'Doctor Agent',   color: '#fbbf24', bg: 'rgba(245,158,11,0.08)', border: '#f59e0b' },
  { id: 'decisionAgent' as const, name: 'Decision Agent', color: '#f87171', bg: 'rgba(239,68,68,0.08)',  border: '#ef4444' },
];

function Row({ label, value }: { label: string; value: string | number | undefined }) {
  if (!value) return null;
  return (
    <div style={{ display: 'flex', gap: 8, marginBottom: 5 }}>
      <span style={{ fontSize: 11, color: '#475569', minWidth: 90, flexShrink: 0 }}>{label}</span>
      <span style={{ fontSize: 11, color: '#cbd5e1', lineHeight: 1.4 }}>{value}</span>
    </div>
  );
}

function Tag({ text, color }: { text: string; color: string }) {
  return (
    <span style={{
      fontSize: 10, padding: '2px 8px', borderRadius: 20,
      background: `${color}20`, color, border: `1px solid ${color}40`,
      marginRight: 4, marginBottom: 4, display: 'inline-block',
    }}>{text}</span>
  );
}

export default function PatientFlowPanel({ agentOutput, patient }: Props) {
  const isEmpty = Object.keys(agentOutput).length === 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#0a0d14' }}>
      <div style={{ padding: '20px 24px', borderBottom: '1px solid #1e293b' }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: '#f1f5f9', margin: 0, marginBottom: 4 }}>Patient Flow</h2>
        <p style={{ fontSize: 12, color: '#64748b', margin: 0 }}>
          {patient ? `${patient.name} — ${patient.chiefComplaint}` : 'Agent output summary'}
        </p>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
        {isEmpty ? (
          <div style={{ textAlign: 'center', paddingTop: 60 }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
              <Users size={22} color="#475569" />
            </div>
            <p style={{ fontSize: 13, color: '#475569', margin: 0 }}>No simulation run yet</p>
            <p style={{ fontSize: 12, color: '#334155', margin: '6px 0 0' }}>Run a simulation to see the patient flow here</p>
          </div>
        ) : (
          AGENTS.map((a, idx) => {
            const out = agentOutput[a.id];
            if (!out) return null;
            return (
              <div key={a.id} style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
                {/* connector */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 18, flexShrink: 0 }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: a.color, boxShadow: `0 0 8px ${a.color}` }} />
                  {idx < AGENTS.length - 1 && <div style={{ width: 2, flex: 1, minHeight: 20, background: `${a.color}30`, margin: '4px 0' }} />}
                </div>

                {/* card */}
                <div style={{ flex: 1, background: a.bg, border: `1px solid ${a.border}30`, borderLeft: `3px solid ${a.border}`, borderRadius: 10, padding: '12px 14px', marginBottom: 4 }}>
                  <p style={{ fontSize: 12, fontWeight: 700, color: a.color, margin: '0 0 10px' }}>{a.name}</p>

                  {a.id === 'patientAgent' && 'summary' in out && (
                    <>
                      <Row label="Summary"     value={(out as NonNullable<AgentOutputMap['patientAgent']>).summary} />
                      <Row label="Demographics" value={(out as NonNullable<AgentOutputMap['patientAgent']>).demographics} />
                      <Row label="Complaint"   value={(out as NonNullable<AgentOutputMap['patientAgent']>).complaint} />
                    </>
                  )}

                  {a.id === 'triageAgent' && 'category' in out && (() => {
                    const t = out as NonNullable<AgentOutputMap['triageAgent']>;
                    return (
                      <>
                        <Row label="Category"  value={`CAT ${t.category} — ${t.categoryName}`} />
                        <Row label="Reasoning" value={t.reasoning} />
                        <div style={{ marginTop: 4 }}>
                          {t.keySymptoms?.map(s => <Tag key={s} text={s} color={a.color} />)}
                        </div>
                      </>
                    );
                  })()}

                  {a.id === 'nurseAgent' && 'vitalsAssessment' in out && (() => {
                    const n = out as NonNullable<AgentOutputMap['nurseAgent']>;
                    return (
                      <>
                        <Row label="Assessment" value={n.vitalsAssessment} />
                        {n.abnormalFlags?.length > 0 && (
                          <div style={{ marginBottom: 6 }}>
                            <span style={{ fontSize: 10, color: '#475569', display: 'block', marginBottom: 3 }}>Abnormal Flags</span>
                            {n.abnormalFlags.map(f => <Tag key={f} text={f} color="#f97316" />)}
                          </div>
                        )}
                        {n.ordersPlaced?.length > 0 && (
                          <div>
                            <span style={{ fontSize: 10, color: '#475569', display: 'block', marginBottom: 3 }}>Orders</span>
                            {n.ordersPlaced.map(o => <Tag key={o} text={o} color={a.color} />)}
                          </div>
                        )}
                      </>
                    );
                  })()}

                  {a.id === 'doctorAgent' && 'clinicalPicture' in out && (() => {
                    const d = out as NonNullable<AgentOutputMap['doctorAgent']>;
                    return (
                      <>
                        <Row label="Clinical"  value={d.clinicalPicture} />
                        <Row label="Reasoning" value={d.reasoning} />
                        <div style={{ marginTop: 4 }}>
                          {d.differentialDiagnosis?.map((dx, i) => (
                            <Tag key={dx} text={i === 0 ? `★ ${dx}` : dx} color={i === 0 ? '#fbbf24' : '#64748b'} />
                          ))}
                        </div>
                      </>
                    );
                  })()}

                  {a.id === 'decisionAgent' && 'disposition' in out && (() => {
                    const d = out as NonNullable<AgentOutputMap['decisionAgent']>;
                    return (
                      <>
                        <Row label="Disposition" value={`${d.disposition} (${Math.round(d.confidence * 100)}%)`} />
                        <Row label="Rationale"   value={d.rationale} />
                      </>
                    );
                  })()}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
