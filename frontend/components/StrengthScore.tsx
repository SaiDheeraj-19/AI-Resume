"use client";

import { motion } from "framer-motion";
import { ResumeStrength } from "@/types/api";
import { Award, TrendingUp, Lightbulb } from "lucide-react";

interface StrengthScoreProps {
  strength: ResumeStrength;
}

const gradeColors: Record<string, string> = {
  "A+": "text-emerald-400",
  A: "text-emerald-400",
  "B+": "text-violet-400",
  B: "text-violet-400",
  "C+": "text-amber-400",
  C: "text-rose-400",
};

const breakdownLabels: Record<string, string> = {
  technical_richness: "Technical Richness",
  soft_skills_balance: "Soft Skills Balance",
  tool_diversity: "Tool Diversity",
  confidence_quality: "Confidence Quality",
};

const breakdownMax: Record<string, number> = {
  technical_richness: 40,
  soft_skills_balance: 20,
  tool_diversity: 20,
  confidence_quality: 20,
};

export default function StrengthScore({ strength }: StrengthScoreProps) {
  const pct = Math.round((strength.total_score / strength.max_score) * 100);
  const gradeColor = gradeColors[strength.grade] ?? "text-white";
  const circumference = 2 * Math.PI * 36;
  const strokeDashoffset = circumference - (pct / 100) * circumference;

  return (
    <div className="rounded-2xl bg-white/5 border border-white/10 p-6 backdrop-blur">
      <div className="flex items-center gap-2 mb-5">
        <Award className="w-4 h-4 text-amber-400" />
        <h3 className="text-sm font-semibold text-white">Resume Strength</h3>
      </div>

      {/* Circular gauge */}
      <div className="flex items-center gap-6 mb-6">
        <div className="relative w-20 h-20 shrink-0">
          <svg viewBox="0 0 80 80" className="w-full h-full -rotate-90">
            <circle cx="40" cy="40" r="36" stroke="rgba(255,255,255,0.1)" strokeWidth="8" fill="none" />
            <motion.circle
              cx="40" cy="40" r="36"
              stroke={pct >= 75 ? "#10b981" : pct >= 55 ? "#8b5cf6" : pct >= 40 ? "#f59e0b" : "#f43f5e"}
              strokeWidth="8" fill="none"
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 1.2, ease: "easeOut" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-xl font-bold ${gradeColor}`}>{strength.grade}</span>
          </div>
        </div>
        <div>
          <p className="text-3xl font-bold text-white">{strength.total_score}</p>
          <p className="text-xs text-white/40">out of {strength.max_score} points</p>
          <div className="mt-1 h-1.5 w-32 rounded-full bg-white/10 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className="h-full rounded-full bg-gradient-to-r from-violet-500 to-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* Breakdown */}
      <div className="space-y-2.5 mb-5">
        {Object.entries(strength.breakdown).map(([key, val]) => {
          const max = breakdownMax[key] ?? 20;
          const bPct = Math.round((val / max) * 100);
          return (
            <div key={key} className="flex items-center gap-3">
              <span className="text-xs text-white/50 w-36 shrink-0">
                {breakdownLabels[key]}
              </span>
              <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${bPct}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="h-full rounded-full bg-gradient-to-r from-violet-500 to-sky-400"
                />
              </div>
              <span className="text-xs text-white/60 shrink-0 w-8 text-right">{val}</span>
            </div>
          );
        })}
      </div>

      {/* Suggestions */}
      {strength.suggestions.length > 0 && (
        <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-xs font-semibold text-amber-400 uppercase tracking-wide">
              Suggestions
            </span>
          </div>
          <ul className="space-y-1.5">
            {strength.suggestions.map((s, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-white/70">
                <TrendingUp className="w-3 h-3 text-amber-400 mt-0.5 shrink-0" />
                {s}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
