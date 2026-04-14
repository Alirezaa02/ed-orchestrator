import type { PatientInput, AgentOutputMap } from './types';

export const N8N_WEBHOOK_URL =
  import.meta.env.VITE_N8N_WEBHOOK_URL ||
  'http://localhost:5678/webhook/ed-simulate';

export async function runSimulation(patient: PatientInput): Promise<AgentOutputMap> {
  const res = await fetch(N8N_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patient),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`n8n error ${res.status}: ${text}`);
  }
  return res.json() as Promise<AgentOutputMap>;
}
