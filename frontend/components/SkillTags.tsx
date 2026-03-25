"use client";

import { motion } from "framer-motion";
import { ExtractionResult } from "@/types/api";
import { Code2, Brain, Wrench } from "lucide-react";

interface SkillTagsProps {
  result: ExtractionResult;
}

const categoryConfig = {
  technical_skills: {
    label: "Technical Skills",
    icon: Code2,
    color: "violet",
    bgClass: "bg-violet-500/15 border-violet-500/30 text-violet-300",
    dotClass: "bg-violet-400",
  },
  soft_skills: {
    label: "Soft Skills",
    icon: Brain,
    color: "sky",
    bgClass: "bg-sky-500/15 border-sky-500/30 text-sky-300",
    dotClass: "bg-sky-400",
  },
  tools: {
    label: "Tools & Platforms",
    icon: Wrench,
    color: "emerald",
    bgClass: "bg-emerald-500/15 border-emerald-500/30 text-emerald-300",
    dotClass: "bg-emerald-400",
  },
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const tagVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1 },
};

export default function SkillTags({ result }: SkillTagsProps) {
  const categories = [
    { key: "technical_skills" as const, skills: result.technical_skills },
    { key: "soft_skills" as const, skills: result.soft_skills },
    { key: "tools" as const, skills: result.tools },
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 md:grid-cols-3 gap-4"
    >
      {categories.map(({ key, skills }) => {
        const config = categoryConfig[key];
        const Icon = config.icon;

        return (
          <motion.div
            key={key}
            variants={cardVariants}
            className="rounded-2xl bg-white/5 border border-white/10 p-5 backdrop-blur"
          >
            <div className="flex items-center gap-2 mb-4">
              <div className={`p-2 rounded-lg bg-${config.color}-500/20`}>
                <Icon className={`w-4 h-4 text-${config.color}-400`} />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">{config.label}</h3>
                <p className="text-xs text-white/40">{skills.length} found</p>
              </div>
            </div>

            {skills.length === 0 ? (
              <p className="text-xs text-white/30 italic">None detected</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {skills.map((skill, i) => {
                  const conf = result.confidence_scores[skill] ?? 0;
                  return (
                    <motion.span
                      key={skill}
                      variants={tagVariants}
                      custom={i}
                      title={`Confidence: ${Math.round(conf * 100)}%`}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${config.bgClass} cursor-default transition-transform hover:scale-105`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${config.dotClass} opacity-70`}
                      />
                      {skill}
                      <span className="opacity-60 text-[10px]">
                        {Math.round(conf * 100)}%
                      </span>
                    </motion.span>
                  );
                })}
              </div>
            )}
          </motion.div>
        );
      })}
    </motion.div>
  );
}
