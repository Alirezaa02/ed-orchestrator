import { useState } from 'react';
import { getWebhookUrl, testConnection } from '../lib/api';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';

export default function SettingsPanel() {
  const [webhookUrl, setWebhookUrl] = useState(getWebhookUrl());
  const [saved,      setSaved]      = useState(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'ok' | 'fail'>('idle');

  const saveUrl = () => {
    localStorage.setItem('n8n_webhook_url', webhookUrl);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleTest = async () => {
    setTestStatus('testing');
    const ok = await testConnection(webhookUrl);
    setTestStatus(ok ? 'ok' : 'fail');
    setTimeout(() => setTestStatus('idle'), 4000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#0a0d14' }}>
      <div style={{ padding: '20px 24px', borderBottom: '1px solid #1e293b' }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: '#f1f5f9', margin: 0, marginBottom: 4 }}>Settings</h2>
        <p style={{ fontSize: 12, color: '#64748b', margin: 0 }}>Configure your ED Orchestrator</p>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>

        {/* n8n Webhook */}
        <section style={{ marginBottom: 28 }}>
          <p style={{ fontSize: 10, fontWeight: 600, color: '#475569', letterSpacing: '0.1em', textTransform: 'uppercase', margin: '0 0 12px' }}>
            n8n Webhook
          </p>
          <div style={{ background: '#0c1018', border: '1px solid #1e293b', borderRadius: 12, padding: '16px' }}>
            <p style={{ fontSize: 12, color: '#64748b', margin: '0 0 10px' }}>
              The URL your React app sends patient data to. Must match the n8n webhook path.
            </p>
            <input
              className="input-field"
              value={webhookUrl}
              onChange={e => setWebhookUrl(e.target.value)}
              placeholder="http://localhost:5678/webhook/ed-simulate"
              style={{ marginBottom: 10 }}
            />
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <button onClick={saveUrl} style={{
                padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer',
                background: saved ? '#166534' : '#2563eb', color: '#fff', fontSize: 13, fontWeight: 600,
                transition: 'background 0.2s',
              }}>
                {saved ? 'Saved!' : 'Save'}
              </button>
              <button onClick={handleTest} disabled={testStatus === 'testing'} style={{
                padding: '8px 16px', borderRadius: 8, border: '1px solid #334155', cursor: 'pointer',
                background: 'transparent', color: '#94a3b8', fontSize: 13, fontWeight: 500,
                display: 'flex', alignItems: 'center', gap: 6,
              }}>
                {testStatus === 'testing' && <Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} />}
                {testStatus === 'ok'      && <CheckCircle2 size={12} color="#4ade80" />}
                {testStatus === 'fail'    && <XCircle size={12} color="#f87171" />}
                Test Connection
              </button>
              {testStatus === 'ok'   && <span style={{ fontSize: 12, color: '#4ade80' }}>n8n is reachable</span>}
              {testStatus === 'fail' && <span style={{ fontSize: 12, color: '#f87171' }}>Cannot reach n8n</span>}
            </div>
          </div>
        </section>

        {/* AI Model */}
        <section style={{ marginBottom: 28 }}>
          <p style={{ fontSize: 10, fontWeight: 600, color: '#475569', letterSpacing: '0.1em', textTransform: 'uppercase', margin: '0 0 12px' }}>
            AI Model
          </p>
          <div style={{ background: '#0c1018', border: '1px solid #1e293b', borderRadius: 12, padding: '16px' }}>
            {[
              { label: 'Provider', value: 'Groq' },
              { label: 'Model',    value: 'llama-3.3-70b-versatile' },
              { label: 'Agents',   value: '5 (Patient → Triage → Nurse → Doctor → Decision)' },
              { label: 'Rate Limit', value: '30 RPM / 14,400 RPD (free tier)' },
            ].map(({ label, value }) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #0f1520' }}>
                <span style={{ fontSize: 12, color: '#64748b' }}>{label}</span>
                <span style={{ fontSize: 12, color: '#cbd5e1', fontFamily: label === 'Model' ? 'monospace' : 'inherit' }}>{value}</span>
              </div>
            ))}
          </div>
        </section>

        {/* About */}
        <section>
          <p style={{ fontSize: 10, fontWeight: 600, color: '#475569', letterSpacing: '0.1em', textTransform: 'uppercase', margin: '0 0 12px' }}>
            About
          </p>
          <div style={{ background: '#0c1018', border: '1px solid #1e293b', borderRadius: 12, padding: '16px' }}>
            {[
              { label: 'App',     value: 'ED Orchestrator AI' },
              { label: 'Version', value: 'v1.0.0' },
              { label: 'Stack',   value: 'React + Vite + n8n + Groq' },
              { label: 'Triage',  value: 'Australian Triage Scale (ATS)' },
            ].map(({ label, value }) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #0f1520' }}>
                <span style={{ fontSize: 12, color: '#64748b' }}>{label}</span>
                <span style={{ fontSize: 12, color: '#cbd5e1' }}>{value}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
