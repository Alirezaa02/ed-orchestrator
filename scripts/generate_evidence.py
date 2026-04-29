import pandas as pd
import json
import os

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

ADM_PATH = os.path.join(BASE, "data files", "admissions.csv", "admissions.csv")
DX_PATH  = os.path.join(BASE, "data files", "diagnoses_icd.csv", "diagnoses_icd.csv")
PAT_PATH = os.path.join(BASE, "data files", "patients.csv", "patients.csv")
OUT_PATH = os.path.join(BASE, "src", "lib", "evidence.json")

print("Loading files...")
adm = pd.read_csv(ADM_PATH)
pat = pd.read_csv(PAT_PATH)
dx  = pd.read_csv(DX_PATH, dtype={'icd_code': str})
dx  = dx[dx['seq_num'] == 1]  # primary diagnosis only
print(f"  admissions: {len(adm):,}  patients: {len(pat):,}  primary dx: {len(dx):,}")

# Filter to ED visits
adm_ed = adm[adm['edregtime'].notna()].copy()
print(f"  ED visits: {len(adm_ed):,}")

# Join demographics and primary diagnosis
adm_ed = adm_ed.merge(pat[['subject_id', 'gender', 'anchor_age']], on='subject_id', how='left')
adm_ed = adm_ed.merge(dx[['hadm_id', 'icd_code', 'icd_version']], on='hadm_id', how='left')

# ICD → complaint category
def map_complaint(row):
    code = str(row.get('icd_code', '')).upper().strip().replace('.', '')
    ver  = row.get('icd_version', 0)
    if ver == 9:
        if code.startswith('7865'):                      return 'chest_pain'
        if code.startswith('7860'):                      return 'dyspnea'
        if code.startswith('7890'):                      return 'abdominal_pain'
        if code.startswith('7840'):                      return 'headache'
        if code.startswith('7802'):                      return 'syncope'
        if code.startswith('7804'):                      return 'dizziness'
        if code.startswith('7800'):                      return 'altered_mental_status'
        if code.startswith('7806'):                      return 'fever'
        if code.startswith('724'):                       return 'back_pain'
        if code.startswith('7870'):                      return 'nausea_vomiting'
        if code.startswith(('434', '436', '435')):       return 'stroke'
        if code.startswith('5990'):                      return 'uti'
        if code.startswith(('296', '300', '311', '295')): return 'psychiatric'
        try:
            num = int(code[:3])
            if 800 <= num <= 959:                        return 'trauma'
        except ValueError:
            pass
    else:
        if code.startswith('R07'):                        return 'chest_pain'
        if code.startswith(('I20', 'I21', 'I22')):        return 'chest_pain'
        if code.startswith('R06'):                        return 'dyspnea'
        if code.startswith(('J18', 'J44', 'J45', 'J96')): return 'dyspnea'
        if code.startswith('R10'):                        return 'abdominal_pain'
        if code.startswith(('K35', 'K57', 'K80')):        return 'abdominal_pain'
        if code.startswith(('R51', 'G44', 'G43')):        return 'headache'
        if code.startswith('R55'):                        return 'syncope'
        if code.startswith('R42'):                        return 'dizziness'
        if code.startswith('R41'):                        return 'altered_mental_status'
        if code.startswith(('R50', 'A41')):               return 'fever'
        if code.startswith('M54'):                        return 'back_pain'
        if code.startswith('R11'):                        return 'nausea_vomiting'
        if code.startswith(('I63', 'I64', 'G45')):        return 'stroke'
        if code.startswith('N39'):                        return 'uti'
        if code.startswith(('S', 'T')):                   return 'trauma'
        if code.startswith('F'):                          return 'psychiatric'
    return None

print("Mapping ICD codes...")
adm_ed['complaint_category'] = adm_ed.apply(map_complaint, axis=1)
mapped = adm_ed['complaint_category'].notna().sum()
print(f"  Mapped {mapped:,} / {len(adm_ed):,} ({mapped/len(adm_ed)*100:.1f}%)")

# Age group
def age_group(age):
    if   age < 18: return '0_17'
    elif age < 40: return '18_39'
    elif age < 60: return '40_59'
    elif age < 80: return '60_79'
    else:          return '80_plus'

adm_ed['age_group'] = adm_ed['anchor_age'].apply(age_group)

# Disposition
def map_disp(row):
    atype = str(row['admission_type']).upper()
    dloc  = str(row['discharge_location']).upper()
    if atype in ('EU OBSERVATION', 'OBSERVATION ADMIT', 'AMBULATORY OBSERVATION'):
        return 'short_stay'
    if dloc in ('HOME', 'HOME HEALTH CARE', 'AGAINST ADVICE'):
        return 'discharge'
    if dloc in ('', 'NAN'):
        return 'unknown'
    return 'admit'

adm_ed['disposition'] = adm_ed.apply(map_disp, axis=1)

# Readable ICD descriptions (top codes we'll encounter)
ICD_DESC = {
    'R0709': 'Chest pain', 'R079': 'Chest pain', 'R0700': 'Pleuritic chest pain',
    'I2109': 'STEMI', 'I200':  'Unstable angina', 'I219':  'STEMI',
    'I2510': 'Coronary artery disease', 'I4891': 'Atrial fibrillation',
    'R0600': 'Dyspnea', 'R0609': 'Dyspnea', 'J189': 'Pneumonia',
    'J440':  'COPD exacerbation', 'J441': 'COPD exacerbation',
    'R109':  'Abdominal pain', 'R1084': 'Generalised abdominal pain',
    'K5700': 'Diverticulitis', 'K8000': 'Cholelithiasis',
    'R51':   'Headache', 'G4309': 'Migraine', 'G431':  'Migraine with aura',
    'R55':   'Syncope', 'R42':   'Dizziness',
    'R4182': 'Altered mental status', 'R410':  'Disorientation',
    'R509':  'Fever', 'A419':   'Sepsis',
    'M5416': 'Low back pain', 'M5430': 'Sciatica', 'M544':  'Lumbago',
    'R11':   'Nausea and vomiting', 'R110':  'Nausea', 'R111':  'Vomiting',
    'I6350': 'Ischaemic stroke', 'G459':  'TIA', 'I639':  'Ischaemic stroke',
    'N390':  'UTI', 'N300':  'Cystitis',
    'F329':  'Depression', 'F419':  'Anxiety', 'F209':  'Schizophrenia',
    # ICD-9 common
    '7865':  'Chest pain', '78650': 'Chest pain', '78659': 'Atypical chest pain',
    '7860':  'Dyspnea',    '7890':  'Abdominal pain',
    '7840':  'Headache',   '7802':  'Syncope',     '7804':  'Dizziness',
    '7806':  'Fever',      '7241':  'Back pain',   '7870':  'Nausea/vomiting',
}

def readable_dx(code):
    c = str(code).upper().strip().replace('.', '')
    if c in ICD_DESC:
        return ICD_DESC[c]
    for k, v in ICD_DESC.items():
        if c.startswith(k):
            return v
    return None  # skip unknowns

# Compute stats for a dataframe slice
def stats(df):
    n = len(df)
    if n < 30:
        return None
    disp  = df['disposition']
    admit = (disp == 'admit').sum()
    ss    = (disp == 'short_stay').sum()
    disc  = (disp == 'discharge').sum()
    mort  = df['hospital_expire_flag'].fillna(0).astype(int).sum()
    urgent = df['admission_type'].isin(['EW EMER.', 'DIRECT EMER.']).sum()

    # Top readable diagnoses
    top_codes = df['icd_code'].value_counts().head(10).index.tolist()
    top_dx = []
    seen = set()
    for c in top_codes:
        label = readable_dx(c)
        if label and label not in seen:
            seen.add(label)
            top_dx.append(label)
        if len(top_dx) == 3:
            break

    return {
        'n':              int(n),
        'admitted_pct':   round(admit   / n * 100, 1),
        'short_stay_pct': round(ss      / n * 100, 1),
        'discharged_pct': round(disc    / n * 100, 1),
        'mortality_pct':  round(mort    / n * 100, 1),
        'high_acuity_pct':round(urgent  / n * 100, 1),
        'top_dx':         top_dx,
    }

# Build evidence dict
evidence = {}
for complaint, grp in adm_ed.dropna(subset=['complaint_category']).groupby('complaint_category'):
    evidence[complaint] = {}
    overall = stats(grp)
    if overall:
        evidence[complaint]['_overall'] = overall
    for gender in ('M', 'F'):
        for ag in ('0_17', '18_39', '40_59', '60_79', '80_plus'):
            key    = f"{ag}_{gender}"
            subset = grp[(grp['gender'] == gender) & (grp['age_group'] == ag)]
            s      = stats(subset)
            if s:
                evidence[complaint][key] = s

print(f"\nEvidence summary:")
for cat, data in sorted(evidence.items()):
    overall = data.get('_overall', {})
    print(f"  {cat:25s}  n={overall.get('n',0):6,}  groups={len(data)-1}")

with open(OUT_PATH, 'w') as f:
    json.dump(evidence, f, indent=2)

size_kb = os.path.getsize(OUT_PATH) / 1024
print(f"\nSaved {OUT_PATH}  ({size_kb:.1f} KB)")
