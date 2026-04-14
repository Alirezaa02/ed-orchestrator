export type TriageCategory = 1 | 2 | 3 | 4 | 5;
export type ArrivalMode = 'Walk-in' | 'Ambulance' | 'GP Referral' | 'Self-referral';
export type AgentStatus = 'waiting' | 'pending' | 'active' | 'done';
export type DispositionLabel = 'Admit to Hospital' | 'Short Stay Unit' | 'Discharge Home';

export interface PatientInput {
  name: string;
  age: number;
  sex: 'M' | 'F';
  arrivalMode: ArrivalMode;
  chiefComplaint: string;
  hr: number;
  rr: number;
  sbp: number;
  dbp: number;
  temp: number;
  spo2: number;
  pmhx: string;
  meds: string;
  allergies: string;
}

export interface AgentOutputMap {
  patientAgent?: {
    summary: string;
    demographics: string;
    complaint: string;
  };
  triageAgent?: {
    category: TriageCategory;
    categoryName: string;
    reasoning: string;
    keySymptoms: string[];
  };
  nurseAgent?: {
    vitalsAssessment: string;
    abnormalFlags: string[];
    ordersPlaced: string[];
    labsOrdered: string[];
  };
  doctorAgent?: {
    clinicalPicture: string;
    differentialDiagnosis: string[];
    reasoning: string;
  };
  decisionAgent?: {
    disposition: DispositionLabel;
    confidence: number;
    probabilities: { admit: number; shortStay: number; discharge: number };
    rationale: string;
  };
}

export interface AgentState {
  id: keyof AgentOutputMap;
  name: string;
  role: string;
  status: AgentStatus;
  thinkingText?: string;
}

export interface EMREntry {
  id: string;
  ts: string;
  agent: string;
  agentId: keyof AgentOutputMap;
  message: string;
  type: 'info' | 'action' | 'result' | 'warning';
}
