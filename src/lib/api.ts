import type { PatientInput, AgentOutputMap } from './types';

export const N8N_WEBHOOK_URL =
  import.meta.env.VITE_N8N_WEBHOOK_URL ||
  'http://localhost:5678/webhook/ed-simulate';

export function getWebhookUrl(): string {
  return localStorage.getItem('n8n_webhook_url') || N8N_WEBHOOK_URL;
}

export async function runSimulation(patient: PatientInput): Promise<AgentOutputMap> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 120_000);

  try {
    const res = await fetch(getWebhookUrl(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patient),
      signal: controller.signal,
    });

    const text = await res.text();
    if (!res.ok) {
      if (res.status === 429 || text.toLowerCase().includes('quota')) throw new Error('RATE_LIMIT');
      throw new Error(`n8n error ${res.status}: ${text}`);
    }
    if (!text || text.trim() === '') throw new Error('EMPTY_RESPONSE');
    try {
      return JSON.parse(text) as AgentOutputMap;
    } catch {
      throw new Error(`INVALID_JSON: ${text.slice(0, 200)}`);
    }
  } catch (err) {
    if ((err as Error).name === 'AbortError') throw new Error('TIMEOUT');
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

export async function testConnection(url: string): Promise<boolean> {
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ _test: true }),
      signal: AbortSignal.timeout(8000),
    });
    return res.status !== 404;
  } catch {
    return false;
  }
}
