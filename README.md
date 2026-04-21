# ED Orchestrator AI

A multi-agent AI system that simulates Emergency Department triage at Royal North Shore Hospital. Five specialist AI agents work in sequence — Patient → Triage → Nurse → Doctor → Decision — each analysing the patient and passing their findings to the next agent, producing a final clinical disposition with confidence scores.

Built as a capstone project to demonstrate how large language models can support clinical decision-making using the **Australian Triage Scale (ATS)**.

---

## What It Does

You enter a patient's details (or pick a demo patient), click **Run Simulation**, and watch:

1. **Patient Agent** — formats the demographics and chief complaint into clinical language
2. **Triage Agent** — assigns an ATS category (CAT 1–5) with reasoning
3. **Nurse Agent** — reviews vitals, flags abnormal values, places nursing orders
4. **Doctor Agent** — forms a differential diagnosis ranked by likelihood
5. **Decision Agent** — outputs a final disposition: **Admit to Hospital**, **Short Stay Unit**, or **Discharge Home** with a confidence percentage

The React dashboard shows all of this in real time — a live agent pipeline, an EMR log, vital sign warnings, probability bars, and an analytics history panel.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Vite |
| Styling | Tailwind CSS + inline styles |
| AI Orchestration | n8n (self-hosted) |
| LLM | Groq API — `llama-3.3-70b-versatile` |
| Persistence | localStorage (settings + analytics) |

---

## Prerequisites

- **Node.js** v18+
- **Python 3** (only if you want to generate the PowerPoint)
- **n8n** installed globally: `npm install -g n8n`
- A free **Groq API key** from [console.groq.com](https://console.groq.com)

---

## How to Run

### 1. Clone the repo

```bash
git clone https://github.com/YOUR_USERNAME/ed-orchestrator.git
cd ed-orchestrator
```

### 2. Install dependencies

```bash
npm install
```

### 3. Start n8n

Open a separate terminal and run:

```bash
n8n start
```

n8n will be available at `http://localhost:5678`

### 4. Import the workflow into n8n

1. Open `http://localhost:5678` in your browser
2. Go to **Workflows → Import from file**
3. Select `n8n-workflows/ed-pipeline.json`
4. Open the workflow and click each **HTTP Request** node
5. Replace `YOUR_GROQ_API_KEY` in the Authorization header with your actual Groq key
6. Click **Save**, then click **Activate** (toggle in the top right)

### 5. Start the React app

```bash
npm run dev
```

Open `http://localhost:5173` in your browser.

### 6. Run a simulation

- Click **Run New Simulation**
- Pick a demo patient (e.g. John Doe — chest pain) or enter your own
- Click **Start Simulation** and watch the agents run

---

## Project Structure

```
ed-orchestrator/
├── src/
│   ├── components/
│   │   ├── Dashboard.tsx          # Root layout, state management, simulation logic
│   │   ├── PatientPanel.tsx       # Left sidebar — patient info + navigation
│   │   ├── PipelinePanel.tsx      # Centre — live agent pipeline with status cards
│   │   ├── EMRPanel.tsx           # Right sidebar — live log + outcome + prob bars
│   │   ├── PatientFlowPanel.tsx   # Agent output summary cards
│   │   ├── AnalyticsPanel.tsx     # Simulation history from localStorage
│   │   ├── SettingsPanel.tsx      # Webhook URL config + model info
│   │   └── NewSimulationModal.tsx # Patient input form (demo or custom)
│   └── lib/
│       ├── types.ts               # All TypeScript interfaces and types
│       ├── api.ts                 # fetch wrapper for n8n webhook
│       └── patients.ts            # Pre-built demo patients
├── n8n-workflows/
│   └── ed-pipeline.json           # Import this into n8n
└── make_pptx.py                   # Generates the presentation (optional)
```

---

## Demo Patients

| Patient | Complaint | Expected Result |
|---|---|---|
| John Doe, 45M | Chest pain, tachycardia, low SpO2 | CAT 2 → Admit to Hospital |
| Jane Smith, 32F | Fever, neck stiffness, photophobia | CAT 2 → Short Stay Unit |
| Tom Lee, 22M | Common cold, normal vitals | CAT 5 → Discharge Home |

---

## Troubleshooting

**"Cannot reach n8n"** — Make sure n8n is running (`n8n start`) and the workflow is activated (not just saved).

**"Empty response"** — Open n8n at `localhost:5678`, go to **Executions**, and check which node failed. Usually means the Groq API key is missing or incorrect.

**"Rate limit exceeded"** — Groq free tier allows 30 requests/minute. Wait 60 seconds and try again.

**Simulation takes too long** — The first request after starting n8n can take 30–60 seconds. This is normal — Groq processes all 5 agents sequentially.

---

## Notes

- This is a capstone proof-of-concept and is **not intended for real clinical use**
- The AI agents use prompt engineering only — no medical training data was used
- All simulation history is stored locally in your browser (localStorage) — nothing is sent to any server except the Groq API

---

*Royal North Shore Emergency Department · Capstone Project 2024*
