from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN
from pptx.enum.shapes import MSO_SHAPE_TYPE
from pptx.oxml.ns import qn
from pptx.util import Emu
import copy

# ── Palette ──────────────────────────────────────────────
BG      = RGBColor(0x0a,0x0d,0x14)
CARD    = RGBColor(0x0f,0x15,0x20)
PANEL   = RGBColor(0x0c,0x10,0x18)
BORDER  = RGBColor(0x1e,0x29,0x3b)
WHITE   = RGBColor(0xff,0xff,0xff)
T1      = RGBColor(0xf1,0xf5,0xf9)
T2      = RGBColor(0x94,0xa3,0xb8)
T3      = RGBColor(0x64,0x74,0x8b)
BLUE    = RGBColor(0x60,0xa5,0xfa)
BLUE2   = RGBColor(0x3b,0x82,0xf6)
PURPLE  = RGBColor(0xc0,0x84,0xfc)
GREEN   = RGBColor(0x4a,0xde,0x80)
AMBER   = RGBColor(0xfb,0xbf,0x24)
RED     = RGBColor(0xf8,0x71,0x71)
RED2    = RGBColor(0xef,0x44,0x44)
ORANGE  = RGBColor(0xf9,0x73,0x16)

prs = Presentation()
prs.slide_width  = Inches(13.33)
prs.slide_height = Inches(7.5)
BLANK = prs.slide_layouts[6]

# ── Helpers ───────────────────────────────────────────────
def dim(c, d):
    """Return a darkened RGBColor by dividing each channel by d."""
    v = int(str(c), 16)
    return RGBColor((v >> 16) // d, ((v >> 8) & 0xFF) // d, (v & 0xFF) // d)

def slide(bg=BG):
    s = prs.slides.add_slide(BLANK)
    fill = s.background.fill
    fill.solid()
    fill.fore_color.rgb = bg
    return s

def box(s, l,t,w,h, fc, lc=None, lw=1):
    sh = s.shapes.add_shape(1, Inches(l),Inches(t),Inches(w),Inches(h))
    sh.fill.solid(); sh.fill.fore_color.rgb = fc
    if lc: sh.line.color.rgb = lc; sh.line.width = Pt(lw)
    else:  sh.line.fill.background()
    return sh

def rbox(s, l,t,w,h, fc, lc=None, lw=1, r=0.1):
    sh = s.shapes.add_shape(9, Inches(l),Inches(t),Inches(w),Inches(h))
    sh.fill.solid(); sh.fill.fore_color.rgb = fc
    if lc: sh.line.color.rgb = lc; sh.line.width = Pt(lw)
    else:  sh.line.fill.background()
    return sh

def txt(s, text, l,t,w,h, sz=16, bold=False, italic=False, color=T1, align=PP_ALIGN.LEFT, wrap=True):
    tb = s.shapes.add_textbox(Inches(l),Inches(t),Inches(w),Inches(h))
    tf = tb.text_frame; tf.word_wrap = wrap
    p  = tf.paragraphs[0]; p.alignment = align
    r  = p.add_run(); r.text = text
    r.font.size=Pt(sz); r.font.bold=bold; r.font.italic=italic
    r.font.color.rgb=color
    return tb

def dot(s, l,t, color, r=0.08):
    sh = s.shapes.add_shape(9, Inches(l),Inches(t),Inches(r*2),Inches(r*2))
    sh.fill.solid(); sh.fill.fore_color.rgb = color
    sh.line.fill.background()
    return sh

def hdr(s, title, color=BLUE, sub=None):
    box(s, 0,0,13.33,1.1, CARD)
    txt(s, title, 0.45,0.12,12,0.7, sz=30, bold=True, color=color)
    if sub: txt(s, sub, 0.45,0.72,12,0.35, sz=12, color=T3)

def pill(s, l,t,w,h, label, bg, fc, sz=11):
    sh = rbox(s,l,t,w,h, bg, fc, lw=1)
    tf = sh.text_frame; tf.word_wrap=False
    p = tf.paragraphs[0]; p.alignment = PP_ALIGN.CENTER
    r = p.add_run(); r.text=label
    r.font.size=Pt(sz); r.font.bold=True; r.font.color.rgb=fc
    return sh

def card(s, l,t,w,h, bg=CARD, bc=BORDER):
    return rbox(s,l,t,w,h, bg, bc, lw=0.75)

def line(s, x1,y1,x2,y2, color=BORDER, w=1.5):
    from pptx.util import Inches
    connector = s.shapes.add_connector(1, Inches(x1),Inches(y1),Inches(x2),Inches(y2))
    connector.line.color.rgb = color; connector.line.width = Pt(w)
    return connector

# ═══════════════════════════════════════════════════════════
# SLIDE 1 — Title
# ═══════════════════════════════════════════════════════════
s1 = slide()
box(s1, 0,0,0.07,7.5, BLUE2)                          # left accent bar
txt(s1,'ED Orchestrator AI', 0.5,1.6,12,1.5, sz=54, bold=True, color=WHITE)
txt(s1,'Multi-Agent Emergency Department Triage System',
    0.5,3.2,12,0.7, sz=22, color=BLUE)
txt(s1,'Powered by n8n · Groq Llama 3.3 · React + Vite',
    0.5,4.0,12,0.5, sz=15, color=T3)

tags = [('React',BLUE2),('TypeScript',BLUE),('n8n',GREEN),('Groq AI',PURPLE),('Llama 3.3 70B',AMBER)]
for i,(lbl,c) in enumerate(tags):
    bg = dim(c, 6)
    pill(s1, 0.5+i*2.3, 5.2, 2.0, 0.45, lbl, bg, c, sz=13)

txt(s1,'Royal North Shore Emergency Department · Capstone Project',
    0.5,6.7,12,0.4, sz=11, color=T3)

# ═══════════════════════════════════════════════════════════
# SLIDE 2 — Problem Statement
# ═══════════════════════════════════════════════════════════
s2 = slide()
hdr(s2,'The Problem', RED, 'Why does ED triage need AI assistance?')

stats = [
    ('8 M+','ED visits/year\nin Australia', RED),
    ('4 hrs','Average wait in\npeak periods', ORANGE),
    ('18%','Patients leave\nwithout being seen', AMBER),
    ('$2 B+','Annual cost of\nED overcrowding', PURPLE),
]
for i,(val,lbl,c) in enumerate(stats):
    x = 0.35 + i*3.25
    card(s2, x,1.3,3.0,2.3, PANEL, c)
    txt(s2, val, x,1.5,3.0,0.9, sz=38, bold=True, color=c, align=PP_ALIGN.CENTER)
    txt(s2, lbl, x,2.55,3.0,0.7, sz=13, color=T2, align=PP_ALIGN.CENTER)

bullets = [
    '⚠   Manual triage is inconsistent under pressure — cognitive overload is real',
    '⚠   Delayed categorisation directly increases morbidity and mortality',
    '⚠   Clinicians need decision support — not replacement — from AI systems',
]
for i,b in enumerate(bullets):
    txt(s2, b, 0.5,3.85+i*0.62,12.5,0.55, sz=15, color=T2)

# ═══════════════════════════════════════════════════════════
# SLIDE 3 — Project Overview
# ═══════════════════════════════════════════════════════════
s3 = slide()
hdr(s3,'Project Overview', GREEN, 'What ED Orchestrator AI does')

points = [
    (GREEN,  'Real-time simulation of an ED triage pipeline using 5 specialised AI agents'),
    (BLUE,   'Each agent has a distinct clinical role — replicating actual ED workflow'),
    (AMBER,  'Based on the Australian Triage Scale (ATS), the standard used in all Australian EDs'),
    (PURPLE, 'Outputs: triage category, clinical reasoning, orders, differential diagnosis & disposition'),
    (RED,    'Built with React frontend + n8n orchestrator + Groq Llama 3.3 70B AI model'),
]
for i,(c,p) in enumerate(points):
    y = 1.4 + i*0.98
    card(s3, 0.4,y,12.5,0.82, PANEL, c)
    box(s3, 0.4,y,0.05,0.82, c).line.fill.background()
    dot(s3, 0.7,y+0.28, c)
    txt(s3, p, 1.0,y+0.18,11.7,0.55, sz=15, color=T1)

# ═══════════════════════════════════════════════════════════
# SLIDE 4 — System Architecture
# ═══════════════════════════════════════════════════════════
s4 = slide()
hdr(s4,'System Architecture', BLUE, 'Three-layer design: Frontend → Orchestrator → AI')

# Three main boxes
arch = [
    (0.5,  'React\nFrontend',  BLUE,   '• Patient input form\n• Live dashboard\n• EMR log & outcome'),
    (5.0,  'n8n\nOrchestrator', GREEN, '• Webhook trigger\n• 16-node pipeline\n• Routes agent calls'),
    (9.5,  'Groq\nLlama 3.3',  PURPLE, '• AI reasoning engine\n• JSON-only responses\n• 5 agent prompts'),
]
for l,title,c,sub in arch:
    card(s4, l,1.5,3.3,3.5, PANEL, c)
    box(s4, l,1.5,3.3,0.06, c).line.fill.background()
    txt(s4, title, l,1.7,3.3,0.9, sz=22, bold=True, color=c, align=PP_ALIGN.CENTER)
    txt(s4, sub,   l,2.8,3.2,1.8, sz=13, color=T2)

# Arrows between boxes
txt(s4,'POST\nJSON', 3.95,2.8,0.9,0.6, sz=11, color=T3, align=PP_ALIGN.CENTER)
txt(s4,'HTTP\nAPI',  8.45,2.8,0.9,0.6, sz=11, color=T3, align=PP_ALIGN.CENTER)
for x in [3.85, 8.35]:
    txt(s4,'──▶', x,3.0,0.9,0.4, sz=18, color=BORDER, align=PP_ALIGN.CENTER)

# Agent flow at bottom
agents = [('Patient',BLUE),('Triage',PURPLE),('Nurse',GREEN),('Doctor',AMBER),('Decision',RED)]
for i,(name,c) in enumerate(agents):
    x = 0.5 + i*2.55
    bg = dim(c, 5)
    pill(s4, x,5.5,2.2,0.55, f'{name}\nAgent', bg, c, sz=12)
    if i<4: txt(s4,'▶', x+2.22,5.63,0.3,0.3, sz=14, color=BORDER)

txt(s4,'Sequential Agent Pipeline', 0.5,5.2,12.5,0.3, sz=11, color=T3, align=PP_ALIGN.CENTER)

# ═══════════════════════════════════════════════════════════
# SLIDE 5 — Technology Stack
# ═══════════════════════════════════════════════════════════
s5 = slide()
hdr(s5,'Technology Stack', AMBER, 'Tools and frameworks used to build the system')

stack = [
    ('Frontend',      'React 18 + Vite + TypeScript',      BLUE,   'Fast SPA with real-time state management and inline dark-theme styles'),
    ('Orchestration', 'n8n (self-hosted, localhost:5678)',  GREEN,  '16-node visual pipeline; webhook trigger routes data between all agents'),
    ('AI Model',      'Groq — Llama 3.3 70B Versatile',    PURPLE, '30 RPM free tier; sub-second inference; OpenAI-compatible API'),
    ('Styling',       'React Inline Styles (dark palette)', AMBER,  'Full control over dark UI; no Tailwind dependency issues in production'),
    ('Version Ctrl',  'Git + GitHub',                       RED,    'Secret scanning enforced; API keys excluded via .gitignore'),
]
for i,(layer,tech,c,desc) in enumerate(stack):
    y = 1.3+i*1.15
    card(s5,0.4,y,12.5,1.0, PANEL, c)
    box(s5,0.4,y,0.06,1.0,c).line.fill.background()
    txt(s5,layer, 0.65,y+0.08,2.2,0.4, sz=11, bold=True, color=T3)
    txt(s5,tech,  0.65,y+0.45,2.2,0.4, sz=14, bold=True, color=c)
    txt(s5,desc,  3.1, y+0.22,9.6,0.6, sz=13, color=T2)

# ═══════════════════════════════════════════════════════════
# SLIDE 6 — The 5 AI Agents
# ═══════════════════════════════════════════════════════════
s6 = slide()
hdr(s6,'The 5 AI Agents', PURPLE, 'Each agent has a distinct clinical role in the pipeline')

agents_detail = [
    (BLUE,  '01  Patient Agent',   'Demographics & complaint collection',
     'Collects patient name, age, sex, arrival mode, chief complaint, PMHx, medications and allergies. Returns a structured clinical summary.'),
    (PURPLE,'02  Triage Agent',    'ATS category assignment',
     'Analyses symptoms and vital signs to assign an ATS category (CAT 1–5). Provides reasoning and identifies key presenting symptoms.'),
    (GREEN, '03  Nurse Agent',     'Vitals, orders & labs',
     'Flags abnormal vital signs (HR, BP, SpO2, Temp, RR), places nursing orders and requests appropriate lab investigations.'),
    (AMBER, '04  Doctor Agent',    'Labs review & clinical reasoning',
     'Reviews the full clinical picture to form a differential diagnosis (primary + 2 alternatives) with supporting clinical reasoning.'),
    (RED,   '05  Decision Agent',  'Final disposition',
     'Synthesises all findings to determine: Admit to Hospital / Short Stay Unit / Discharge Home — with confidence score and rationale.'),
]
for i,(c,name,role,desc) in enumerate(agents_detail):
    y = 1.25+i*1.18
    card(s6,0.4,y,12.5,1.08, PANEL, c)
    box(s6,0.4,y,0.06,1.08,c).line.fill.background()
    txt(s6,name, 0.65,y+0.05,3.5,0.45, sz=15, bold=True, color=c)
    txt(s6,role, 0.65,y+0.58,3.5,0.38, sz=11, color=T3)
    txt(s6,desc, 4.3, y+0.2, 8.4,0.65, sz=13, color=T2)

# ═══════════════════════════════════════════════════════════
# SLIDE 7 — Australian Triage Scale
# ═══════════════════════════════════════════════════════════
s7 = slide()
hdr(s7,'Australian Triage Scale (ATS)', AMBER, 'The clinical standard used in all Australian emergency departments')

ats = [
    ('CAT 1','Resuscitation',  'Immediately',  RGBColor(0x7f,0x1d,0x1d), RGBColor(0xef,0x44,0x44), RGBColor(0xfc,0xa5,0xa5),
     'Cardiac arrest, airway compromise, major trauma with haemodynamic instability'),
    ('CAT 2','Emergency',      'Within 10 min', RGBColor(0x7c,0x2d,0x12), RGBColor(0xf9,0x73,0x16), RGBColor(0xfd,0xba,0x74),
     'Chest pain, stroke, severe respiratory distress, altered consciousness'),
    ('CAT 3','Urgent',         'Within 30 min', RGBColor(0x71,0x3f,0x12), RGBColor(0xea,0xb3,0x08), RGBColor(0xfd,0xe0,0x47),
     'Moderate pain, significant infection, head injury without LOC'),
    ('CAT 4','Semi-Urgent',    'Within 60 min', RGBColor(0x14,0x53,0x2d), RGBColor(0x22,0xc5,0x5e), RGBColor(0x86,0xef,0xac),
     'Minor fractures, minor infections, chronic pain flare-up'),
    ('CAT 5','Non-Urgent',     'Within 120 min', RGBColor(0x1e,0x3a,0x5f), RGBColor(0x3b,0x82,0xf6), RGBColor(0x93,0xc5,0xfd),
     'Minor rash, prescription refill, minor cold symptoms'),
]
for i,(cat,name,time,bg,border,text,ex) in enumerate(ats):
    y = 1.25+i*1.18
    box(s7,0.4,y,12.5,1.08, bg).line.color.rgb = border
    box(s7,0.4,y,0.08,1.08, border).line.fill.background()
    txt(s7,cat,  0.65,y+0.08,1.4,0.45, sz=18, bold=True, color=text)
    txt(s7,name, 0.65,y+0.60,1.4,0.38, sz=12, color=border)
    txt(s7,time, 2.2, y+0.3, 2.1,0.45, sz=14, bold=True, color=text, align=PP_ALIGN.CENTER)
    txt(s7,ex,   4.5, y+0.25,8.2,0.58, sz=12, color=text)

# ═══════════════════════════════════════════════════════════
# SLIDE 8 — n8n Workflow
# ═══════════════════════════════════════════════════════════
s8 = slide()
hdr(s8,'n8n Orchestration Workflow', GREEN, '16-node pipeline connecting the React frontend to Groq AI')

# Workflow diagram
nodes = [
    (0.3, 'Webhook\n(POST)', BLUE2),
]
agent_pairs = [
    ('Build\nPatient', 'Patient\nAgent', 'Parse\nPatient', BLUE),
    ('Build\nTriage',  'Triage\nAgent',  'Parse\nTriage',  PURPLE),
    ('Build\nNurse',   'Nurse\nAgent',   'Parse\nNurse',   GREEN),
    ('Build\nDoctor',  'Doctor\nAgent',  'Parse\nDoctor',  AMBER),
    ('Build\nDecision','Decision\nAgent','Parse\nDecision',RED),
]

# Webhook node
card(s8, 0.25,1.6,1.3,1.1, PANEL, BLUE2)
txt(s8,'Webhook', 0.25,1.75,1.3,0.4, sz=11, bold=True, color=BLUE2, align=PP_ALIGN.CENTER)
txt(s8,'POST trigger', 0.25,2.2,1.3,0.35, sz=9, color=T3, align=PP_ALIGN.CENTER)

x = 1.7
for build,agent,parse,c in agent_pairs:
    bg = dim(c, 5)
    # Build
    card(s8,x,1.3,1.55,0.65, bg, c)
    txt(s8,build, x,1.38,1.55,0.5, sz=9, color=c, align=PP_ALIGN.CENTER)
    # HTTP
    card(s8,x,2.1,1.55,0.65, bg, c)
    txt(s8,agent, x,2.18,1.55,0.5, sz=9, bold=True, color=c, align=PP_ALIGN.CENTER)
    # Parse
    card(s8,x,2.9,1.55,0.65, bg, c)
    txt(s8,parse, x,2.98,1.55,0.5, sz=9, color=c, align=PP_ALIGN.CENTER)
    x += 1.7

# Respond node
card(s8,x,1.6,1.3,1.1, PANEL, GREEN)
txt(s8,'Respond', x,1.75,1.3,0.4, sz=11, bold=True, color=GREEN, align=PP_ALIGN.CENTER)
txt(s8,'JSON response', x,2.2,1.3,0.35, sz=9, color=T3, align=PP_ALIGN.CENTER)

# Labels
txt(s8,'Build Prompt (Code nodes)', 0.2,1.2,13,0.3, sz=10, color=T3, align=PP_ALIGN.CENTER)
txt(s8,'Call Groq API (HTTP nodes)', 0.2,2.0,13,0.3, sz=10, color=T3, align=PP_ALIGN.CENTER)
txt(s8,'Parse Response (Code nodes)', 0.2,2.8,13,0.3, sz=10, color=T3, align=PP_ALIGN.CENTER)

# Flow description
desc = [
    ('1', 'React app sends patient JSON to n8n webhook', BLUE),
    ('2', 'Each agent: Code node builds Groq prompt → HTTP node calls API → Code node parses JSON', GREEN),
    ('3', 'Data accumulates across nodes using $("Node").first().json references', AMBER),
    ('4', 'Respond node returns all 5 agent outputs as a single JSON to the React app', PURPLE),
]
for i,(n,d,c) in enumerate(desc):
    y = 3.8+i*0.67
    dot(s8,0.45,y+0.05,c)
    txt(s8,d, 0.75,y,12.2,0.55, sz=13, color=T2)

# ═══════════════════════════════════════════════════════════
# SLIDE 9 — Dashboard UI
# ═══════════════════════════════════════════════════════════
s9 = slide()
hdr(s9,'Dashboard UI', BLUE, 'Three-panel real-time interface')

panels = [
    (0.3,  3.0, BLUE,   'LEFT PANEL\nPatient Card',
     '• Patient demographics\n• Vital signs (colour-coded warnings)\n• ATS category badge\n• Navigation menu\n• Run / Stop simulation'),
    (4.7,  3.0, GREEN,  'CENTRE PANEL\nAgent Pipeline',
     '• Live agent status cards\n• Thinking text animation\n• Dot connector timeline\n• Patient journey tracker\n• Step counter'),
    (9.1,  3.0, PURPLE, 'RIGHT PANEL\nEMR Live Log',
     '• Real-time agent activity\n• Colour-coded log entries\n• Error messages + retry\n• Disposition badge\n• Probability bars'),
]
for l,w,c,title,bullets in panels:
    card(s9,l,1.3,w,5.9, PANEL, c)
    box(s9,l,1.3,w,0.06,c).line.fill.background()
    txt(s9,title,   l,1.4,w,0.75, sz=12, bold=True, color=c, align=PP_ALIGN.CENTER)
    txt(s9,bullets, l+0.15,2.35,w-0.3,4.5, sz=12, color=T2)

# ═══════════════════════════════════════════════════════════
# SLIDE 10 — Live Demo
# ═══════════════════════════════════════════════════════════
s10 = slide()
hdr(s10,'Live Demo', RED, 'Simulating a real ED presentation — John Doe, chest pain')

steps = [
    (BLUE,   '1  Open the app',        'localhost:5173 — 3-panel dark dashboard loads'),
    (BLUE,   '2  Click Run Simulation', 'Modal appears — select "John Doe" demo patient'),
    (PURPLE, '3  Watch Patient Agent',  'Collects demographics, formats chief complaint in clinical language'),
    (PURPLE, '4  Watch Triage Agent',   'Assigns CAT 2 Emergency — reasoning displayed in EMR log'),
    (GREEN,  '5  Watch Nurse Agent',    'Flags abnormal HR, places IV access and ECG orders'),
    (AMBER,  '6  Watch Doctor Agent',   'Differential: NSTEMI, Pulmonary Embolism, Aortic dissection'),
    (RED,    '7  View Outcome',         'Decision Agent: Admit to Hospital — 89% confidence'),
]
for i,(c,step,detail) in enumerate(steps):
    y = 1.3+i*0.84
    bg = dim(c, 6)
    card(s10,0.4,y,12.5,0.75, bg, c)
    box(s10,0.4,y,0.06,0.75,c).line.fill.background()
    txt(s10,step,   0.65,y+0.12,3.5,0.45, sz=14, bold=True, color=c)
    txt(s10,detail, 4.3, y+0.18,8.5,0.45, sz=13, color=T2)

# ═══════════════════════════════════════════════════════════
# SLIDE 11 — Challenges & Solutions
# ═══════════════════════════════════════════════════════════
s11 = slide()
hdr(s11,'Challenges & Solutions', AMBER, 'Real problems encountered and how they were resolved')

challenges = [
    (RED,    'Gemini API Rate Limits',
     'Free tier (15 RPM) exhausted during development from repeated test runs',
     'Switched to Groq API (30 RPM, 14,400 RPD free tier) with Llama 3.3 70B'),
    (ORANGE, 'n8n Data Loss Between Nodes',
     'HTTP Request nodes overwrite input data with API response — previous agent outputs lost',
     'Used $("Build X Payload").first().json in Code nodes to recover accumulated data'),
    (PURPLE, 'fetch / https Blocked in n8n Sandbox',
     'n8n Code node vm2 sandbox blocks fetch(), require("https"), and $helpers.httpRequest',
     'Returned to HTTP Request nodes (native n8n) — bypasses sandbox restrictions entirely'),
    (BLUE,   'Tailwind CSS v4 Not Rendering',
     'Dark colour utilities (bg-slate-800 etc.) not processing correctly in Vite + v4',
     'Replaced all Tailwind classes with React inline style objects using explicit hex colours'),
    (GREEN,  'API Keys Pushed to GitHub',
     'GitHub secret scanning blocked push — Groq key was hardcoded in workflow JSON',
     'Replaced with YOUR_GROQ_API_KEY placeholder; keys stored only in n8n node config'),
]
for i,(c,ch,prob,sol) in enumerate(challenges):
    y = 1.3+i*1.18
    bg = dim(c, 7)
    card(s11,0.4,y,12.5,1.08, bg, c)
    box(s11,0.4,y,0.06,1.08,c).line.fill.background()
    txt(s11,ch,   0.65,y+0.05,12,0.38, sz=14, bold=True, color=c)
    txt(s11,'⚠  '+prob, 0.65,y+0.48,5.5,0.38, sz=11, color=T3)
    txt(s11,'✓  '+sol,  6.3, y+0.48,6.5,0.38, sz=11, color=GREEN)

# ═══════════════════════════════════════════════════════════
# SLIDE 12 — Results & Outcomes
# ═══════════════════════════════════════════════════════════
s12 = slide()
hdr(s12,'Results & Outcomes', GREEN, 'What the system successfully demonstrates')

results = [
    (GREEN,  '✓  End-to-End Pipeline',   '5 agents complete sequentially in ~15–30 seconds per simulation'),
    (BLUE,   '✓  Accurate Triage',       'ATS categories match expected clinical classification for all test cases'),
    (PURPLE, '✓  Clinical Reasoning',    'Differential diagnoses and rationale align with standard ED presentation patterns'),
    (AMBER,  '✓  Real-Time Animation',   'Live EMR log and agent status update progressively without page refresh'),
    (RED,    '✓  Configurable System',   'Webhook URL editable via Settings; simulation history tracked in Analytics'),
]
for i,(c,title,desc) in enumerate(results):
    y = 1.35+i*0.95
    card(s12,0.4,y,12.5,0.82, PANEL, c)
    box(s12,0.4,y,0.06,0.82,c).line.fill.background()
    txt(s12,title, 0.65,y+0.18,4.0,0.45, sz=15, bold=True, color=c)
    txt(s12,desc,  4.9, y+0.22,8.0,0.45, sz=14, color=T2)

# Test patients
txt(s12,'Test Patients Validated', 0.4,6.15,12.5,0.35, sz=12, bold=True, color=T3)
patients = [
    ('John Doe','Chest pain · CAT 2','Admit to Hospital', RED),
    ('Jane Smith','Headache + neck stiffness · CAT 2','Short Stay Unit', AMBER),
    ('Tom Lee','Common cold · CAT 5','Discharge Home', GREEN),
    ('Custom','User-defined input · any CAT','Variable', BLUE),
]
for i,(name,detail,disp,c) in enumerate(patients):
    x = 0.4+i*3.25
    bg = dim(c, 6)
    card(s12,x,6.5,3.0,0.75, bg, c)
    txt(s12,name,   x,6.55,3.0,0.3, sz=11, bold=True, color=c, align=PP_ALIGN.CENTER)
    txt(s12,disp,   x,6.85,3.0,0.3, sz=10, color=T3, align=PP_ALIGN.CENTER)

# ═══════════════════════════════════════════════════════════
# SLIDE 13 — Key Learnings
# ═══════════════════════════════════════════════════════════
s13 = slide()
hdr(s13,'Key Learnings', BLUE, 'Technical and clinical insights from building this system')

learnings = [
    (BLUE,  'Multi-Agent Orchestration',
     'Chaining AI agents with distinct roles produces more structured and reliable output than a single large prompt. Each agent\'s context window stays focused.'),
    (PURPLE,'Prompt Engineering for Clinical JSON',
     'Explicit JSON schema examples in the prompt dramatically reduce hallucination and format errors. Low temperature (0.3) improves consistency.'),
    (GREEN, 'n8n as an AI Orchestrator',
     'n8n\'s visual pipeline makes agent sequencing transparent and debuggable — but Code node sandboxing restricts HTTP calls. HTTP Request nodes are the solution.'),
    (AMBER, 'React Real-Time UI Patterns',
     'Client-side animation (useState + async delays) creates the illusion of live agent activity while the backend processes in one batch request.'),
    (RED,   'API Rate Limit Strategy',
     'Free-tier APIs require careful management. Monitoring RPM usage, switching providers (Gemini → Groq), and adding retry logic are essential production skills.'),
]
for i,(c,title,desc) in enumerate(learnings):
    y = 1.3+i*1.18
    bg = dim(c, 6)
    card(s13,0.4,y,12.5,1.07, bg, c)
    box(s13,0.4,y,0.06,1.07,c).line.fill.background()
    txt(s13,title, 0.65,y+0.06,3.8,0.4, sz=14, bold=True, color=c)
    txt(s13,desc,  4.6, y+0.17,8.2,0.72, sz=12, color=T2)

# ═══════════════════════════════════════════════════════════
# SLIDE 14 — Future Work
# ═══════════════════════════════════════════════════════════
s14 = slide()
hdr(s14,'Future Work', PURPLE, 'Pathways to production deployment')

future = [
    (BLUE,  'HL7 FHIR Integration',     'Connect to real hospital EMR systems using the FHIR R4 standard for live patient data'),
    (GREEN, 'Multi-Patient Queue',       'Manage a live ED queue — prioritise, re-triage, and track multiple patients simultaneously'),
    (PURPLE,'Radiology Agent',           'Add a 6th agent to interpret uploaded X-rays and CT reports using vision-capable models'),
    (AMBER, 'Fine-Tuned Clinical Model', 'Fine-tune on real ED presentations to improve triage accuracy beyond general-purpose LLMs'),
    (RED,   'Hospital Deployment',       'Deploy behind hospital intranet with proper auth, audit logging, and HIPAA/Privacy Act compliance'),
    (BLUE,  'Outcome Feedback Loop',     'Track actual patient outcomes and use reinforcement learning to improve disposition accuracy'),
]
cols = [(0.4, future[:3]), (6.85, future[3:])]
for startx,items in cols:
    for i,(c,title,desc) in enumerate(items):
        y = 1.35+i*1.88
        bg = dim(c, 6)
        card(s14,startx,y,6.1,1.65, bg, c)
        box(s14,startx,y,0.06,1.65,c).line.fill.background()
        txt(s14,title, startx+0.25,y+0.15,5.7,0.45, sz=14, bold=True, color=c)
        txt(s14,desc,  startx+0.25,y+0.7, 5.7,0.75, sz=12, color=T2)

# ═══════════════════════════════════════════════════════════
# SLIDE 15 — Conclusion & Q&A
# ═══════════════════════════════════════════════════════════
s15 = slide()
box(s15,0,0,0.07,7.5,GREEN).line.fill.background()

txt(s15,'Conclusion', 0.5,0.6,12,0.9, sz=40, bold=True, color=WHITE)
txt(s15,'ED Orchestrator AI demonstrates that multi-agent AI systems can meaningfully assist\nclinical decision-making in high-pressure emergency department environments.',
    0.5,1.55,12,0.9, sz=17, color=T2)

summary = [
    (GREEN,  '5 AI agents collaborate to replicate real ED clinical workflow'),
    (BLUE,   'Australian Triage Scale correctly applied in simulated presentations'),
    (PURPLE, 'Modern stack: React + n8n + Groq — local, free, production-quality'),
    (AMBER,  'Extensible architecture — ready for real EMR integration and fine-tuning'),
]
for i,(c,point) in enumerate(summary):
    dot(s15,0.55,2.72+i*0.62,c)
    txt(s15,point, 0.85,2.65+i*0.62,11.5,0.5, sz=15, color=T1)

# Divider
box(s15,0.5,5.3,12.3,0.03,BORDER).line.fill.background()

txt(s15,'Thank you', 0.5,5.5,7,0.6, sz=28, bold=True, color=GREEN)
txt(s15,'Questions welcome', 0.5,6.1,7,0.4, sz=16, color=T3)

txt(s15,'GitHub', 9.0,5.5,4.3,0.35, sz=11, color=T3)
txt(s15,'github.com/Alirezaa02/ed-orchestrator', 9.0,5.85,4.3,0.4, sz=12, bold=True, color=BLUE)
txt(s15,'Stack', 9.0,6.3,4.3,0.35, sz=11, color=T3)
txt(s15,'React · n8n · Groq · Llama 3.3 70B', 9.0,6.65,4.3,0.4, sz=12, color=PURPLE)

# ── Save ──────────────────────────────────────────────────
out = '/Users/alireza/Desktop/ED_Orchestrator_Presentation.pptx'
prs.save(out)
print(f'Saved: {out}')
