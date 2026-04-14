import type { PatientInput } from './types';

export const DEMO_PATIENTS: PatientInput[] = [
  {
    name: 'John Doe', age: 45, sex: 'M', arrivalMode: 'Walk-in',
    chiefComplaint: 'Severe chest pressure radiating to left arm, onset 45 minutes ago',
    hr: 112, rr: 22, sbp: 165, dbp: 95, temp: 37.1, spo2: 94,
    pmhx: 'Hypertension, hyperlipidaemia', meds: 'Amlodipine 5mg, Atorvastatin 40mg', allergies: 'Penicillin',
  },
  {
    name: 'Jane Smith', age: 32, sex: 'F', arrivalMode: 'GP Referral',
    chiefComplaint: 'High fever 39.8°C, severe headache, neck stiffness, photophobia',
    hr: 102, rr: 18, sbp: 128, dbp: 82, temp: 39.8, spo2: 97,
    pmhx: 'Nil significant', meds: 'OCP', allergies: 'Nil known',
  },
  {
    name: 'Tom Lee', age: 22, sex: 'M', arrivalMode: 'Walk-in',
    chiefComplaint: 'Mild sore throat, runny nose, low-grade fever for 2 days',
    hr: 78, rr: 14, sbp: 118, dbp: 76, temp: 37.6, spo2: 99,
    pmhx: 'Nil', meds: 'Nil', allergies: 'Nil known',
  },
];
