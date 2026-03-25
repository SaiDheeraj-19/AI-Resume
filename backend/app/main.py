import time
from contextlib import asynccontextmanager

from dotenv import load_dotenv
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from app.extractor import extract_skills, load_models
from app.models import ExtractionResponse
from app.parsers import extract_text_from_docx, extract_text_from_pdf
from app.utils import compute_resume_strength, compute_skill_gap

load_dotenv()

ALLOWED_TYPES = {
    "application/pdf": "pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
    "application/msword": "doc",
}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Load heavy models once at startup."""
    load_models()
    yield


app = FastAPI(
    title="Resume Skill Extractor API",
    description="Extract and categorize skills from PDF/DOCX resumes using hybrid NLP.",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health_check():
    return {"status": "ok", "message": "Resume Skill Extractor API is running."}


@app.post("/api/extract", response_model=ExtractionResponse)
async def extract_resume_skills(file: UploadFile = File(...)):
    """
    Upload a PDF or DOCX resume and extract structured skills.
    """
    # ── Validation ──────────────────────────────────────────────────────────
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=415,
            detail=f"Unsupported file type: {file.content_type}. Please upload a PDF or DOCX file.",
        )

    file_bytes = await file.read()

    if len(file_bytes) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=413,
            detail="File size exceeds the 10 MB limit.",
        )

    if len(file_bytes) == 0:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    # ── Text Extraction ──────────────────────────────────────────────────────
    start = time.perf_counter()

    try:
        file_type = ALLOWED_TYPES[file.content_type]
        if file_type == "pdf":
            raw_text = extract_text_from_pdf(file_bytes)
        else:
            raw_text = extract_text_from_docx(file_bytes)
    except Exception as e:
        raise HTTPException(
            status_code=422,
            detail=f"Failed to parse resume file: {str(e)}",
        )

    if not raw_text or len(raw_text.strip()) < 50:
        raise HTTPException(
            status_code=422,
            detail="Resume appears to be empty or contains no readable text.",
        )

    # ── Skill Extraction ─────────────────────────────────────────────────────
    try:
        extraction_result = extract_skills(raw_text)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Skill extraction failed: {str(e)}",
        )

    # ── Bonus Features ───────────────────────────────────────────────────────
    resume_strength = compute_resume_strength(extraction_result)

    all_skills = (
        extraction_result["technical_skills"]
        + extraction_result["soft_skills"]
        + extraction_result["tools"]
    )
    skill_gap = compute_skill_gap(all_skills)

    elapsed_ms = round((time.perf_counter() - start) * 1000, 2)

    return ExtractionResponse(
        technical_skills=extraction_result["technical_skills"],
        soft_skills=extraction_result["soft_skills"],
        tools=extraction_result["tools"],
        confidence_scores=extraction_result["confidence_scores"],
        total_skills_found=extraction_result["total_skills_found"],
        resume_strength=resume_strength,
        skill_gap=skill_gap,
        processing_time_ms=elapsed_ms,
        raw_text_preview=raw_text[:500],
    )
