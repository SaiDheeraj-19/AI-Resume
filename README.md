# Resume Skill Extractor

A production-ready, AI-powered web application that extracts and categorizes skills from PDF/DOCX resumes using a **hybrid NLP pipeline** (spaCy + KeyBERT + custom dictionary).

## Project Structure

```
resume-skill-extractor/
├── backend/                  # FastAPI Python backend
│   ├── app/
│   │   ├── main.py          # FastAPI app, routes, CORS, lifespan
│   │   ├── extractor.py     # Hybrid NLP pipeline (spaCy + KeyBERT + dict)
│   │   ├── parsers.py       # PDF (PyMuPDF) + DOCX (python-docx) parsing
│   │   ├── utils.py         # Confidence scoring, strength score, gap analysis
│   │   └── models.py        # Pydantic response models
│   ├── data/
│   │   └── skills_dictionary.json   # 200+ curated skills
│   ├── .env
│   ├── requirements.txt
│   └── run.py
└── frontend/                 # Next.js 16 frontend
    ├── app/
    │   ├── layout.tsx
    │   └── page.tsx          # Main dashboard with full upload + results flow
    ├── components/
    │   ├── FileUpload.tsx    # Drag-and-drop with validation
    │   ├── SkillTags.tsx     # Categorized skill tags with confidence %
    │   ├── ConfidenceBars.tsx # Animated horizontal score bars
    │   ├── StrengthScore.tsx # Circular gauge + breakdown + suggestions
    │   └── GapAnalysis.tsx   # Role match % vs top 5 job roles
    ├── types/api.ts          # TypeScript API types
    └── .env.local
```

## Quick Start

### 1. Backend Setup
```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python -m spacy download en_core_web_sm
uvicorn app.main:app --reload --port 8000
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
# Open http://localhost:3000
```

## API

### `POST /api/extract`
Upload a resume file (multipart/form-data):

**Response:**
```json
{
  "technical_skills": ["python", "react", "docker"],
  "soft_skills": ["leadership", "communication"],
  "tools": ["jira", "figma"],
  "confidence_scores": {"python": 0.842},
  "total_skills_found": 24,
  "resume_strength": {
    "total_score": 76,
    "max_score": 100,
    "grade": "A",
    "breakdown": {...},
    "suggestions": ["Add more tools..."]
  },
  "skill_gap": {
    "Full Stack Developer": {
      "match_percentage": 71,
      "present_skills": ["react", "typescript"],
      "missing_skills": ["postgresql"]
    }
  },
  "processing_time_ms": 1234.5,
  "raw_text_preview": "..."
}
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16 (App Router) + TypeScript |
| Styling | Tailwind CSS + Shadcn UI |
| Animation | Framer Motion |
| Backend | FastAPI + Uvicorn |
| PDF Parsing | PyMuPDF |
| DOCX Parsing | python-docx |
| NLP | spaCy en_core_web_sm |
| Keywords | KeyBERT + all-MiniLM-L6-v2 |

## Features

- 🔍 **Hybrid NLP**: Dictionary matching + spaCy NER + KeyBERT semantic extraction
- 📊 **Confidence Scores**: Frequency + keyword strength + context relevance
- 🎯 **Skill Gap Analysis**: Compare against 5 top job roles
- 📈 **Resume Strength Score**: A-C+ grade with breakdown and suggestions
- ⚡ **Fast**: Models loaded once at startup, response typically <5 seconds
- 🛡️ **Error handling**: File type, size, and empty content validation
