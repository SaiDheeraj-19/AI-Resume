"use client";

import { motion } from "framer-motion";
import { ExtractionResult } from "@/types/api";

interface ConfidenceBarsProps {
  result: ExtractionResult;
}

function getBarColor(score: number): string {
  if (score >= 0.75) return "from-emerald-500 to-emerald-400";
  if (score >= 0.5) return "from-violet-500 to-violet-400";
  if (score >= 0.25) return "from-amber-500 to-amber-400";
  return "from-rose-500 to-rose-400";
}

function getLabel(score: number): string {
  if (score >= 0.75) return "HIGH";
  if (score >= 0.5) return "MEDIUM";
  if (score >= 0.25) return "LOW";
  return "WEAK";
}

export default function ConfidenceBars({ result }: ConfidenceBarsProps) {
  const allSkills = [
    ...result.technical_skills,
    ...result.soft_skills,
    ...result.tools,
  ];
  const sorted = allSkills
    .filter((s) => result.confidence_scores[s] !== undefined)
    .sort((a, b) => (result.confidence_scores[b] ?? 0) - (result.confidence_scores[a] ?? 0))
    .slice(0, 15);

  return (
    <div className="rounded-2xl bg-white/5 border border-white/10 p-6 backdrop-blur">
      <h3 className="text-sm font-semibold text-white mb-5">
        Confidence Scores
        <span className="ml-2 text-white/40 font-normal text-xs">(top {sorted.length})</span>
      </h3>
      <div className="space-y-3">
        {sorted.map((skill, i) => {
          const score = result.confidence_scores[skill] ?? 0;
          const pct = Math.round(score * 100);
          const barColor = getBarColor(score);
          const label = getLabel(score);

          return (
            <div key={skill} className="flex items-center gap-3 group">
              <span className="text-xs text-white/60 w-32 truncate shrink-0 group-hover:text-white transition-colors">
                {skill}
              </span>
              <div className="flex-1 h-2 rounded-full bg-white/10 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ delay: i * 0.04, duration: 0.6, ease: "easeOut" }}
                  className={`h-full rounded-full bg-gradient-to-r ${barColor}`}
                />
              </div>
              <span className={`text-[10px] font-bold w-14 text-right shrink-0 ${
                score >= 0.75 ? "text-emerald-400" :
                score >= 0.5 ? "text-violet-400" :
                score >= 0.25 ? "text-amber-400" :
                "text-rose-400"
              }`}>
                {pct}% {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
