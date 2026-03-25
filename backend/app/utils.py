import json
import re
import time
from pathlib import Path
from typing import Any

DATA_DIR = Path(__file__).parent.parent / "data"


def load_skill_dictionary() -> dict[str, list[str]]:
    """Load skill dictionary from JSON file."""
    with open(DATA_DIR / "skills_dictionary.json", "r") as f:
        return json.load(f)


def clean_text(text: str) -> str:
    """Remove noise from extracted resume text."""
    # Remove excessive whitespace
    text = re.sub(r"\s+", " ", text)
    # Remove special characters but keep alphanumeric, spaces, and common punctuation
    text = re.sub(r"[^\w\s\.\,\-\+\#\/\@]", " ", text)
    # Remove very short tokens that are likely noise
    text = re.sub(r"\b\w{1,1}\b", " ", text)
    # Normalize whitespace again
    text = re.sub(r"\s+", " ", text).strip()
    return text


def normalize_skill(skill: str) -> str:
    """Normalize skill string for comparison."""
    return skill.lower().strip().replace("-", " ").replace(".", "")


def merge_skills(
    spacy_skills: list[str],
    keybert_skills: list[str],
    dict_skills: list[str],
) -> list[str]:
    """Merge skills from multiple sources, deduplicate by normalized form."""
    seen_normalized: set[str] = set()
    merged: list[str] = []

    for skill in dict_skills + spacy_skills + keybert_skills:
        norm = normalize_skill(skill)
        if norm and norm not in seen_normalized:
            seen_normalized.add(norm)
            merged.append(skill.lower().strip())

    return merged


def compute_confidence(
    skill: str,
    text: str,
    keybert_scores: dict[str, float],
) -> float:
    """
    Compute confidence score for a skill based on:
    - Frequency in document
    - KeyBERT score (if available)
    - Presence of context words nearby
    """
    text_lower = text.lower()
    skill_lower = skill.lower()

    # Frequency score (normalized, cap at 5 occurrences)
    count = text_lower.count(skill_lower)
    freq_score = min(count / 5.0, 1.0)

    # KeyBERT score (already 0-1)
    kb_score = keybert_scores.get(skill_lower, 0.0)

    # Context bonus: skill appears near relevant section keywords
    context_keywords = [
        "experience", "skills", "technologies", "proficient",
        "expertise", "worked with", "using", "developed", "built",
    ]
    context_score = 0.0
    for kw in context_keywords:
        if kw in text_lower:
            # Check proximity (within 200 chars of the skill)
            idx = text_lower.find(skill_lower)
            while idx != -1:
                snippet = text_lower[max(0, idx - 200) : idx + 200]
                if kw in snippet:
                    context_score = 0.2
                    break
                idx = text_lower.find(skill_lower, idx + 1)
            if context_score > 0:
                break

    # Weighted combination
    confidence = 0.4 * freq_score + 0.4 * kb_score + 0.2 * context_score
    return round(min(confidence, 1.0), 3)


def compute_resume_strength(result: dict[str, Any]) -> dict[str, Any]:
    """
    Compute an overall resume strength score and provide suggestions.
    """
    tech_count = len(result.get("technical_skills", []))
    soft_count = len(result.get("soft_skills", []))
    tools_count = len(result.get("tools", []))

    scores = {}
    suggestions = []

    # Technical richness (max 40 pts)
    tech_score = min(tech_count * 2.5, 40)
    scores["technical_richness"] = round(tech_score)
    if tech_count < 5:
        suggestions.append("Add more technical skills (programming languages, frameworks, cloud platforms).")

    # Soft skills balance (max 20 pts)
    soft_score = min(soft_count * 2.5, 20)
    scores["soft_skills_balance"] = round(soft_score)
    if soft_count < 3:
        suggestions.append("Include soft skills like leadership, communication, or teamwork.")

    # Tool diversity (max 20 pts)
    tool_score = min(tools_count * 2.5, 20)
    scores["tool_diversity"] = round(tool_score)
    if tools_count < 3:
        suggestions.append("Mention tools you use (Jira, Figma, Postman, VS Code, etc.).")

    # Confidence quality (max 20 pts)
    all_confidence = list(result.get("confidence_scores", {}).values())
    avg_conf = sum(all_confidence) / len(all_confidence) if all_confidence else 0
    conf_score = round(avg_conf * 20)
    scores["confidence_quality"] = conf_score
    if avg_conf < 0.5:
        suggestions.append("Use skill names more frequently in context to improve clarity.")

    total = sum(scores.values())
    grade = (
        "A+" if total >= 85 else
        "A" if total >= 75 else
        "B+" if total >= 65 else
        "B" if total >= 55 else
        "C+" if total >= 45 else
        "C"
    )

    if not suggestions:
        suggestions.append("Your resume looks well-rounded! Consider adding certifications for extra impact.")

    return {
        "total_score": total,
        "max_score": 100,
        "grade": grade,
        "breakdown": scores,
        "suggestions": suggestions,
    }


def compute_skill_gap(extracted_skills: list[str]) -> dict[str, Any]:
    """
    Compute skill gap against popular job roles.
    Returns which high-demand skills are missing.
    """
    role_requirements = {
        "Full Stack Developer": [
            "react", "node.js", "typescript", "postgresql", "docker", "git", "restful api"
        ],
        "Data Scientist": [
            "python", "machine learning", "pandas", "numpy", "scikit-learn", "sql", "tensorflow"
        ],
        "DevOps Engineer": [
            "docker", "kubernetes", "terraform", "aws", "ci/cd", "linux", "jenkins"
        ],
        "ML Engineer": [
            "python", "pytorch", "tensorflow", "kubernetes", "docker", "mlops", "sql"
        ],
        "Frontend Developer": [
            "react", "typescript", "css", "next.js", "tailwind css", "jest", "figma"
        ],
    }

    extracted_lower = {s.lower() for s in extracted_skills}
    gap_analysis = {}

    for role, required in role_requirements.items():
        present = [s for s in required if any(s in e for e in extracted_lower)]
        missing = [s for s in required if not any(s in e for e in extracted_lower)]
        match_pct = round(len(present) / len(required) * 100)
        gap_analysis[role] = {
            "match_percentage": match_pct,
            "present_skills": present,
            "missing_skills": missing,
        }

    # Sort by match percentage descending
    sorted_gap = dict(
        sorted(gap_analysis.items(), key=lambda x: x[1]["match_percentage"], reverse=True)
    )
    return sorted_gap
