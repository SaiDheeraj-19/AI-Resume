export interface ExtractionResult {
  technical_skills: string[];
  soft_skills: string[];
  tools: string[];
  confidence_scores: Record<string, number>;
  total_skills_found: number;
  resume_strength: ResumeStrength;
  skill_gap: SkillGap;
  processing_time_ms: number;
  raw_text_preview: string;
}

export interface ResumeStrength {
  total_score: number;
  max_score: number;
  grade: string;
  breakdown: {
    technical_richness: number;
    soft_skills_balance: number;
    tool_diversity: number;
    confidence_quality: number;
  };
  suggestions: string[];
}

export interface SkillGapEntry {
  match_percentage: number;
  present_skills: string[];
  missing_skills: string[];
}

export type SkillGap = Record<string, SkillGapEntry>;
