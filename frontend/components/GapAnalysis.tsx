"use client";

import { motion } from "framer-motion";
import { SkillGap } from "@/types/api";
import { Target, CheckCircle2, XCircle, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

interface GapAnalysisProps {
  skillGap: SkillGap;
}

const getRoleColor = (pct: number) => {
  if (pct >= 80) return { bar: "from-emerald-500 to-emerald-400", text: "text-emerald-400", badge: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30" };
  if (pct >= 60) return { bar: "from-violet-500 to-violet-400", text: "text-violet-400", badge: "bg-violet-500/15 text-violet-300 border-violet-500/30" };
  if (pct >= 40) return { bar: "from-amber-500 to-amber-400", text: "text-amber-400", badge: "bg-amber-500/15 text-amber-300 border-amber-500/30" };
  return { bar: "from-rose-500 to-rose-400", text: "text-rose-400", badge: "bg-rose-500/15 text-rose-300 border-rose-500/30" };
};

export default function GapAnalysis({ skillGap }: GapAnalysisProps) {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="rounded-2xl bg-white/5 border border-white/10 p-6 backdrop-blur">
      <div className="flex items-center gap-2 mb-5">
        <Target className="w-4 h-4 text-sky-400" />
        <h3 className="text-sm font-semibold text-white">Skill Gap Analysis</h3>
        <span className="ml-auto text-xs text-white/40">vs top roles</span>
      </div>

      <div className="space-y-3">
        {Object.entries(skillGap).map(([role, data], i) => {
          const colors = getRoleColor(data.match_percentage);
          const isOpen = expanded === role;

          return (
            <motion.div
              key={role}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              className="rounded-xl border border-white/10 overflow-hidden"
            >
              <button
                onClick={() => setExpanded(isOpen ? null : role)}
                className="w-full flex items-center gap-3 p-3.5 hover:bg-white/5 transition-colors text-left"
              >
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-medium text-white">{role}</span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${colors.badge}`}>
                      {data.match_percentage}%
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${data.match_percentage}%` }}
                      transition={{ delay: i * 0.08 + 0.2, duration: 0.7, ease: "easeOut" }}
                      className={`h-full rounded-full bg-gradient-to-r ${colors.bar}`}
                    />
                  </div>
                </div>
                {isOpen ? (
                  <ChevronUp className="w-4 h-4 text-white/40 shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-white/40 shrink-0" />
                )}
              </button>

              <motion.div
                initial={false}
                animate={{ height: isOpen ? "auto" : 0, opacity: isOpen ? 1 : 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                <div className="px-4 pb-4 grid grid-cols-2 gap-4">
                  {data.present_skills.length > 0 && (
                    <div>
                      <p className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wide mb-2 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> You have
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {data.present_skills.map((s) => (
                          <span key={s} className="px-2 py-0.5 rounded-full text-[11px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {data.missing_skills.length > 0 && (
                    <div>
                      <p className="text-[10px] text-rose-400 font-semibold uppercase tracking-wide mb-2 flex items-center gap-1">
                        <XCircle className="w-3 h-3" /> Missing
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {data.missing_skills.map((s) => (
                          <span key={s} className="px-2 py-0.5 rounded-full text-[11px] bg-rose-500/10 border border-rose-500/20 text-rose-300">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
