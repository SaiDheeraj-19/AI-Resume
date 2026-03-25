"""
Hybrid Skill Extractor:
1. spaCy NER - catch organization/product names that map to skills
2. KeyBERT - semantic keyword extraction
3. Dictionary matching - exact/substring match against skill dictionary
"""
import re
from typing import Any

import spacy
from keybert import KeyBERT

from app.utils import (
    clean_text,
    compute_confidence,
    load_skill_dictionary,
    merge_skills,
    normalize_skill,
)

# ─── Module-level singletons (loaded once at startup) ────────────────────────
_nlp: spacy.Language | None = None
_kw_model: KeyBERT | None = None
_skill_dict: dict[str, list[str]] = {}


def load_models() -> None:
    """Load all NLP models at application startup."""
    global _nlp, _kw_model, _skill_dict
    print("⏳ Loading spaCy model...")
    _nlp = spacy.load("en_core_web_sm")
    print("⏳ Loading KeyBERT model...")
    _kw_model = KeyBERT(model="all-MiniLM-L6-v2")
    print("⏳ Loading skill dictionary...")
    _skill_dict = load_skill_dictionary()
    print("✅ All models loaded successfully.")


# ─── Internal helpers ─────────────────────────────────────────────────────────

def _extract_spacy_tokens(text: str) -> list[str]:
    """Extract noun chunks and named entities that likely represent skills."""
    assert _nlp is not None
    doc = _nlp(text[:100_000])  # cap to avoid OOM on huge resumes

    candidates: list[str] = []
    # Named entities: ORG entities often = tools/frameworks/companies
    for ent in doc.ents:
        if ent.label_ in {"ORG", "PRODUCT", "GPE", "WORK_OF_ART"}:
            candidates.append(ent.text.lower().strip())

    # Noun chunks - single or double word technical terms
    for chunk in doc.noun_chunks:
        token = chunk.text.lower().strip()
        words = token.split()
        if 1 <= len(words) <= 3 and not any(
            w in {"the", "a", "an", "my", "our", "your", "their", "its"} for w in words
        ):
            candidates.append(token)

    return candidates


def _extract_keybert_keywords(text: str) -> list[tuple[str, float]]:
    """Use KeyBERT to extract semantically relevant keywords."""
    assert _kw_model is not None
    # Use diversity to reduce redundant keywords
    keywords = _kw_model.extract_keywords(
        text[:8000],
        keyphrase_ngram_range=(1, 3),
        stop_words="english",
        use_mmr=True,
        diversity=0.5,
        top_n=50,
    )
    return keywords  # list of (word, score)


def _match_dictionary(text: str) -> list[str]:
    """Match skills from the dictionary against the resume text."""
    text_lower = text.lower()
    matched: list[str] = []

    all_skills = (
        _skill_dict.get("technical_skills", [])
        + _skill_dict.get("soft_skills", [])
        + _skill_dict.get("tools", [])
    )

    for skill in all_skills:
        # Use word boundary matching (handles "c++" and multi-word skills)
        pattern = r"(?<![a-zA-Z0-9\-\+#])" + re.escape(skill) + r"(?![a-zA-Z0-9\-\+#])"
        if re.search(pattern, text_lower):
            matched.append(skill)

    return matched


def _categorize_skill(skill: str) -> str:
    """Return category label for a skill based on dictionary membership."""
    norm = normalize_skill(skill)
    for category in ["technical_skills", "soft_skills", "tools"]:
        for dict_skill in _skill_dict.get(category, []):
            if norm == normalize_skill(dict_skill) or norm in normalize_skill(dict_skill):
                return category
    return "technical_skills"  # default


# ─── Public API ───────────────────────────────────────────────────────────────

def extract_skills(raw_text: str) -> dict[str, Any]:
    """
    Full skill extraction pipeline.
    Returns structured output with categorized skills and confidence scores.
    """
    if not raw_text or len(raw_text.strip()) < 50:
        raise ValueError("Resume text is too short or empty.")

    cleaned = clean_text(raw_text)

    # 1. Dictionary matching (fastest, highest precision)
    dict_matched = _match_dictionary(cleaned)

    # 2. spaCy NER + noun chunks
    spacy_candidates = _extract_spacy_tokens(cleaned)

    # 3. KeyBERT semantic extraction
    kb_results = _extract_keybert_keywords(cleaned)
    kb_skills = [kw for kw, score in kb_results]
    kb_scores_map = {kw.lower(): float(score) for kw, score in kb_results}

    # 4. Merge and deduplicate
    all_skills = merge_skills(spacy_candidates, kb_skills, dict_matched)

    # 5. Filter: keep only those that appear in text or dictionary
    text_lower = cleaned.lower()
    filtered_skills: list[str] = []
    for skill in all_skills:
        skill_lower = skill.lower()
        in_text = skill_lower in text_lower
        in_dict = any(
            normalize_skill(skill) == normalize_skill(d)
            for cat in _skill_dict.values()
            for d in cat
        )
        if in_text and (in_dict or len(skill.split()) <= 2):
            filtered_skills.append(skill)

    # 6. Categorize
    categorized: dict[str, list[str]] = {
        "technical_skills": [],
        "soft_skills": [],
        "tools": [],
    }
    confidence_scores: dict[str, float] = {}

    for skill in filtered_skills:
        category = _categorize_skill(skill)
        if skill not in categorized[category]:
            categorized[category].append(skill)
            confidence_scores[skill] = compute_confidence(skill, cleaned, kb_scores_map)

    # 7. Sort each category by confidence descending
    for cat in categorized:
        categorized[cat] = sorted(
            categorized[cat],
            key=lambda s: confidence_scores.get(s, 0),
            reverse=True,
        )

    return {
        **categorized,
        "confidence_scores": confidence_scores,
        "total_skills_found": sum(len(v) for v in categorized.values()),
        "raw_text_length": len(cleaned),
    }
