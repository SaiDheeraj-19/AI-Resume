"use client";

import { useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileText, X, CheckCircle2, Loader2 } from "lucide-react";

interface FileUploadProps {
  onUpload: (file: File) => void;
  isLoading: boolean;
}

export default function FileUpload({ onUpload, isLoading }: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const validateFile = (file: File): boolean => {
    const allowed = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/msword",
    ];
    if (!allowed.includes(file.type)) {
      setError("Invalid file type. Please upload a PDF or DOCX file.");
      return false;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("File size exceeds 10 MB limit.");
      return false;
    }
    setError(null);
    return true;
  };

  const handleFile = useCallback(
    (file: File) => {
      if (validateFile(file)) {
        setSelectedFile(file);
        onUpload(file);
      }
    },
    [onUpload]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragActive(false);
      const file = e.dataTransfer.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const clearFile = () => {
    setSelectedFile(null);
    setError(null);
  };

  return (
    <div className="w-full max-w-xl mx-auto">
      <AnimatePresence mode="wait">
        {!selectedFile ? (
          <motion.div
            key="dropzone"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.2 }}
            onDragEnter={() => setDragActive(true)}
            onDragLeave={() => setDragActive(false)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            className={`relative cursor-pointer rounded-2xl border-2 border-dashed p-12 text-center transition-all duration-300 ${
              dragActive
                ? "border-violet-400 bg-violet-500/10 scale-[1.02]"
                : "border-white/20 bg-white/5 hover:border-violet-400/60 hover:bg-white/10"
            }`}
          >
            <input
              type="file"
              accept=".pdf,.docx,.doc"
              onChange={handleChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={isLoading}
            />
            <motion.div
              animate={{ y: dragActive ? -6 : 0 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="flex flex-col items-center gap-4"
            >
              <div className="p-4 rounded-full bg-violet-500/20 border border-violet-400/30">
                <Upload className="w-8 h-8 text-violet-400" />
              </div>
              <div>
                <p className="text-lg font-semibold text-white mb-1">
                  Drop your resume here
                </p>
                <p className="text-sm text-white/50">
                  or click to browse • PDF, DOCX up to 10MB
                </p>
              </div>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key="file-preview"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="rounded-2xl bg-white/10 backdrop-blur border border-white/20 p-5 flex items-center gap-4"
          >
            <div className="p-3 rounded-xl bg-violet-500/20 border border-violet-400/30">
              <FileText className="w-6 h-6 text-violet-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-white truncate">{selectedFile.name}</p>
              <p className="text-xs text-white/50">
                {(selectedFile.size / 1024).toFixed(1)} KB
              </p>
            </div>
            {isLoading ? (
              <Loader2 className="w-5 h-5 text-violet-400 animate-spin shrink-0" />
            ) : (
              <div className="flex items-center gap-2 shrink-0">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <button
                  onClick={clearFile}
                  className="p-1 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <X className="w-4 h-4 text-white/50" />
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-3 text-sm text-rose-400 text-center"
          >
            ⚠ {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
