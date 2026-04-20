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
  const text = await res.text();
  if (!res.ok) throw new Error(`n8n error ${res.status}: ${text}`);
  if (!text || text.trim() === '') throw new Error('n8n returned empty response — check Executions tab in n8n to see which node failed');
  try {
    return JSON.parse(text) as AgentOutputMap;
  } catch {
    throw new Error(`n8n response is not valid JSON. Got: ${text.slice(0, 200)}`);
  }
}
