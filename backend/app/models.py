from pydantic import BaseModel
from typing import Any


class ExtractionResponse(BaseModel):
    technical_skills: list[str]
    soft_skills: list[str]
    tools: list[str]
    confidence_scores: dict[str, float]
    total_skills_found: int
    resume_strength: dict[str, Any]
    skill_gap: dict[str, Any]
    processing_time_ms: float
    raw_text_preview: str


class ErrorResponse(BaseModel):
    detail: str
    error_code: str
