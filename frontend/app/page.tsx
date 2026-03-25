"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import FileUpload from "@/components/FileUpload";
import SkillTags from "@/components/SkillTags";
import ConfidenceBars from "@/components/ConfidenceBars";
import StrengthScore from "@/components/StrengthScore";
import GapAnalysis from "@/components/GapAnalysis";
import { ExtractionResult } from "@/types/api";
import {
  Cpu,
  Zap,
  Clock,
  BookOpen,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

export default function Home() {
  const [result, setResult] = useState<ExtractionResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = useCallback(async (file: File) => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`${API_URL}/api/extract`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: "Unknown error" }));
        throw new Error(err.detail ?? `Server error: ${res.status}`);
      }

      const data: ExtractionResult = await res.json();
      setResult(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleReset = () => {
    setResult(null);
    setError(null);
  };

  return (
    <main className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Background gradient orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-violet-600/10 blur-[120px]" />
        <div className="absolute top-1/2 -right-40 w-[500px] h-[500px] rounded-full bg-sky-600/10 blur-[120px]" />
        <div className="absolute -bottom-40 left-1/3 w-[400px] h-[400px] rounded-full bg-emerald-600/8 blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-semibold tracking-wide mb-6">
            <Cpu className="w-3.5 h-3.5" />
            AI-POWERED RESUME ANALYSIS
          </div>
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-br from-white via-white/90 to-white/50 bg-clip-text text-transparent mb-4 leading-tight">
            Resume Skill
            <br />
            Extractor
          </h1>
          <p className="text-white/50 text-lg max-w-xl mx-auto">
            Upload your resume to instantly extract, categorize, and score your
            skills using hybrid AI — no data stored, no sign-up required.
          </p>

          {/* Feature pills */}
          <div className="flex flex-wrap justify-center gap-2 mt-6">
            {[
              { icon: Zap, label: "Under 5 seconds" },
              { icon: BookOpen, label: "PDF & DOCX" },
              { icon: Clock, label: "≥85% accuracy" },
            ].map(({ icon: Icon, label }) => (
              <span
                key={label}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-white/60"
              >
                <Icon className="w-3 h-3 text-violet-400" />
                {label}
              </span>
            ))}
          </div>
        </motion.div>

        {/* Upload section */}
        <AnimatePresence mode="wait">
          {!result && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-8"
            >
              <FileUpload onUpload={handleUpload} isLoading={isLoading} />

              {/* Loading state */}
              <AnimatePresence>
                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mt-8 flex flex-col items-center gap-4"
                  >
                    <div className="relative w-16 h-16">
                      <div className="absolute inset-0 rounded-full border-2 border-violet-500/30" />
                      <div className="absolute inset-0 rounded-full border-t-2 border-violet-400 animate-spin" />
                      <div className="absolute inset-2 rounded-full bg-violet-500/10 flex items-center justify-center">
                        <Cpu className="w-5 h-5 text-violet-400" />
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="text-white font-medium">Analyzing your resume…</p>
                      <p className="text-sm text-white/40 mt-1">
                        Running NLP pipeline · spaCy + KeyBERT + Dictionary
                      </p>
                    </div>
                    <div className="flex gap-1 mt-1">
                      {["Extracting text", "Finding skills", "Scoring confidence"].map(
                        (step, i) => (
                          <span
                            key={step}
                            className="px-2 py-0.5 rounded text-[10px] bg-violet-500/10 text-violet-400 border border-violet-500/20"
                            style={{ animationDelay: `${i * 0.5}s` }}
                          >
                            {step}
                          </span>
                        )
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Error state */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mt-6 max-w-xl mx-auto rounded-2xl bg-rose-500/10 border border-rose-500/30 p-4 flex items-start gap-3"
                  >
                    <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-rose-300">Extraction failed</p>
                      <p className="text-xs text-rose-400/80 mt-0.5">{error}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results dashboard */}
        <AnimatePresence>
          {result && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* Stats bar */}
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div className="flex flex-wrap gap-3">
                  <StatChip
                    label="Skills Found"
                    value={String(result.total_skills_found)}
                    color="violet"
                  />
                  <StatChip
                    label="Processing Time"
                    value={`${result.processing_time_ms}ms`}
                    color="sky"
                  />
                  <StatChip
                    label="Resume Grade"
                    value={result.resume_strength.grade}
                    color="emerald"
                  />
                </div>
                <button
                  onClick={handleReset}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-sm text-white/70 hover:text-white transition-all"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Analyze Another
                </button>
              </div>

              {/* Skill tags */}
              <div className="mb-4">
                <SkillTags result={result} />
              </div>

              {/* Bottom grid: confidence + strength + gap */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-1">
                  <ConfidenceBars result={result} />
                </div>
                <div className="lg:col-span-1">
                  <StrengthScore strength={result.resume_strength} />
                </div>
                <div className="lg:col-span-1">
                  <GapAnalysis skillGap={result.skill_gap} />
                </div>
              </div>

              {/* Text preview */}
              {result.raw_text_preview && (
                <motion.details
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="mt-4 rounded-2xl bg-white/3 border border-white/10"
                >
                  <summary className="px-5 py-3 text-xs text-white/40 cursor-pointer hover:text-white/60 transition-colors select-none">
                    View extracted text preview
                  </summary>
                  <div className="px-5 pb-4">
                    <p className="text-xs text-white/40 font-mono whitespace-pre-wrap leading-relaxed">
                      {result.raw_text_preview}
                    </p>
                  </div>
                </motion.details>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}

function StatChip({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: "violet" | "sky" | "emerald";
}) {
  const colorMap = {
    violet: "bg-violet-500/10 border-violet-500/20 text-violet-300",
    sky: "bg-sky-500/10 border-sky-500/20 text-sky-300",
    emerald: "bg-emerald-500/10 border-emerald-500/20 text-emerald-300",
  };
  return (
    <div className={`px-4 py-2 rounded-xl border ${colorMap[color]} text-center`}>
      <p className="text-lg font-bold">{value}</p>
      <p className="text-[10px] opacity-70">{label}</p>
    </div>
  );
}
