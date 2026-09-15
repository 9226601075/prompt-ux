"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { normalizeImageAnalysis, type ImageAnalysisResult } from "@/lib/imageAnalysis/types";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ACCEPTED_FILE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const ACCEPTED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"];

function formatFileSize(bytes: number) {
  if (bytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function isAcceptedImage(file: File) {
  const fileName = file.name.toLowerCase();
  if (file.type) {
    return ACCEPTED_FILE_TYPES.includes(file.type);
  }

  return ACCEPTED_EXTENSIONS.some((extension) => fileName.endsWith(extension));
}

type ImagePromptAnalyzerProps = {
  onAnalysisChange?: (analysis: ImageAnalysisResult | null) => void;
};

export default function ImagePromptAnalyzer({ onAnalysisChange }: ImagePromptAnalyzerProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [analysisError, setAnalysisError] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [analysis, setAnalysis] = useState<ImageAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showJson, setShowJson] = useState(false);
  const [optimizedPrompt, setOptimizedPrompt] = useState("");
  const [promptCopied, setPromptCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const previewUrl = useMemo(() => selectedFile ? URL.createObjectURL(selectedFile) : "", [selectedFile]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  function selectFile(file: File | undefined) {
    setAnalysisError("");
    setStatusMessage("");
    setAnalysis(null);
    onAnalysisChange?.(null);
    setShowJson(false);
    setOptimizedPrompt("");
    setPromptCopied(false);

    if (!file) return;

    if (!isAcceptedImage(file)) {
      setSelectedFile(null);
      setAnalysisError("Unsupported file type. Please choose a JPG, PNG, or WEBP image.");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setSelectedFile(null);
      setAnalysisError("That image is larger than 10 MB. Please choose a smaller file.");
      return;
    }

    setSelectedFile(file);
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    selectFile(event.target.files?.[0]);
    event.target.value = "";
  }

  function handleDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);
    selectFile(event.dataTransfer.files[0]);
  }

  function handleDropZoneKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      inputRef.current?.click();
    }
  }

  function removeImage() {
    setSelectedFile(null);
    setAnalysisError("");
    setStatusMessage("");
    setAnalysis(null);
    onAnalysisChange?.(null);
    setShowJson(false);
    setOptimizedPrompt("");
    setPromptCopied(false);
  }

  async function handleAnalyze() {
    if (!selectedFile || isAnalyzing) return;

    setIsAnalyzing(true);
    setAnalysisError("");
    setStatusMessage("");
    setAnalysis(null);
    setOptimizedPrompt("");

    try {
      const formData = new FormData();
      formData.append("image", selectedFile);
      const response = await fetch("/api/analyze-image", { method: "POST", body: formData });
      const data = await response.json() as {
        analysis?: unknown;
        optimizedPrompt?: string;
        error?: string;
        modelUsed?: string;
        fallbackUsed?: boolean;
        diagnostics?: {
          modelSelected: string;
          realAnalysisSucceeded: boolean;
          fallbackUsed: boolean;
          demoModeUsed: boolean;
        };
      };

      if (!response.ok || !data.analysis) {
        setAnalysisError(data.error ?? "Unable to analyze this image. Please try again.");
        return;
      }

      const normalizedAnalysis = normalizeImageAnalysis(data.analysis);
      setAnalysis(normalizedAnalysis);
      onAnalysisChange?.(normalizedAnalysis);
      setOptimizedPrompt(data.optimizedPrompt ?? "");
      setStatusMessage(data.fallbackUsed
        ? `Real image analysis complete using fallback model (${data.modelUsed ?? "unknown"}).`
        : "Real image analysis complete.");
      if (data.diagnostics) {
        setStatusMessage(`${data.diagnostics.realAnalysisSucceeded ? "Real vision analysis succeeded" : "Real vision analysis failed"} · model: ${data.diagnostics.modelSelected} · fallback: ${data.diagnostics.fallbackUsed ? "yes" : "no"} · demo: ${data.diagnostics.demoModeUsed ? "yes" : "no"}`);
      }
    } catch (error) {
      setAnalysisError(error instanceof Error && error.message.includes("incomplete")
        ? "The image analysis response was incomplete. Please try again."
        : "Failed to reach the image analysis service. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  }

  async function copyOptimizedPrompt() {
    if (!optimizedPrompt) return;

    await navigator.clipboard.writeText(optimizedPrompt);
    setPromptCopied(true);
    window.setTimeout(() => setPromptCopied(false), 1800);
  }

  function renderList(items: string[]) {
    return items.length > 0 ? items.join(", ") : "None detected";
  }

  return (
    <section className="min-w-0 rounded-2xl border border-slate-800/90 bg-slate-900/80 p-5 shadow-2xl shadow-black/20 sm:p-6" aria-labelledby="image-prompt-heading">
      <div className="mb-5 flex flex-col gap-2 border-b border-slate-800 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 id="image-prompt-heading" className="text-sm font-semibold text-slate-200">Analyze a visual reference</h2>
          <p className="mt-1 text-sm leading-6 text-slate-500">Upload an image to extract its visual structure and prompt details.</p>
        </div>
        <span className="text-xs text-slate-500">JPG, PNG, or WEBP · Max 10 MB</span>
      </div>

      {!selectedFile ? (
        <div
          role="button"
          tabIndex={0}
          onClick={() => inputRef.current?.click()}
          onKeyDown={handleDropZoneKeyDown}
          onDragOver={(event) => {
            event.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`rounded-xl border border-dashed p-6 text-center transition-colors sm:p-8 ${
            isDragging
              ? "border-blue-400 bg-blue-500/10"
              : "border-slate-700 bg-slate-950/40 hover:border-blue-400/60 hover:bg-slate-950/70"
          }`}
          aria-label="Upload an image by selecting a file or dragging it here"
        >
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-blue-400/20 bg-blue-500/10 text-xl text-blue-200" aria-hidden="true">
            ⇧
          </div>
          <p className="mt-4 text-sm font-semibold text-slate-200">Drop an image here</p>
          <p className="mt-1 text-xs text-slate-500">or use the button below to browse your device</p>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              inputRef.current?.click();
            }}
            className="mt-4 rounded-xl border border-blue-400/30 bg-blue-500/10 px-4 py-2.5 text-sm font-semibold text-blue-100 transition-colors hover:bg-blue-500/20"
          >
            Upload Image
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] sm:items-center">
          <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-950/60">
            {previewUrl && (
              <Image
                src={previewUrl}
                alt={`Preview of ${selectedFile.name}`}
                width={640}
                height={360}
                unoptimized
                className="aspect-video h-full max-h-64 w-full object-contain bg-slate-950"
              />
            )}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-200" title={selectedFile.name}>{selectedFile.name}</p>
            <p className="mt-1 text-xs text-slate-500">{formatFileSize(selectedFile.size)}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm font-medium text-slate-200 transition-colors hover:border-blue-400/60"
              >
                Change Image
              </button>
              <button
                type="button"
                onClick={removeImage}
                className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm font-medium text-red-200 transition-colors hover:bg-red-500/20"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}

      <input ref={inputRef} type="file" accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp" onChange={handleFileChange} className="sr-only" aria-label="Choose an image file" />

      {analysisError && (
        <p role="alert" className="mt-3 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2.5 text-sm text-red-300">{analysisError}</p>
      )}

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-slate-500" aria-live="polite">{statusMessage || "Your image stays in this browser until analysis is available."}</p>
        <button
          type="button"
          onClick={handleAnalyze}
          disabled={!selectedFile || isAnalyzing}
          className="w-full rounded-xl bg-blue-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-950/30 transition-colors hover:bg-blue-400 disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
        >
          {isAnalyzing ? "Analyzing..." : "Analyze Image"}
        </button>
      </div>

      {analysis && (
        <div className="mt-5 border-t border-slate-800 pt-5" aria-labelledby="image-analysis-result-heading">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 id="image-analysis-result-heading" className="text-sm font-semibold text-slate-100">Image Analysis</h3>
            <button
              type="button"
              onClick={() => setShowJson((value) => !value)}
              className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-300 transition-colors hover:border-blue-400/60"
            >
              {showJson ? "Hide JSON" : "View JSON"}
            </button>
          </div>

          {optimizedPrompt && (
            <div className="mt-3 rounded-xl border border-blue-400/20 bg-blue-500/10 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-blue-100">Optimized Image Prompt</p>
                <button
                  type="button"
                  onClick={copyOptimizedPrompt}
                  className="rounded-lg border border-blue-300/30 bg-blue-500/10 px-3 py-1.5 text-xs font-medium text-blue-100 transition-colors hover:bg-blue-500/20"
                >
                  {promptCopied ? "Copied" : "Copy Prompt"}
                </button>
              </div>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-blue-50">{optimizedPrompt}</p>
            </div>
          )}

          {showJson ? (
            <pre className="mt-3 max-h-96 overflow-auto whitespace-pre-wrap rounded-xl border border-slate-800 bg-slate-950 p-4 text-xs leading-relaxed text-slate-300">{JSON.stringify(analysis, null, 2)}</pre>
          ) : (
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3 md:col-span-2"><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Main Subject</p><p className="mt-1 text-sm text-slate-200">{analysis.subject || "Not detected"}</p></div>
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3"><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Environment</p><p className="mt-1 text-sm text-slate-300">{analysis.environment || "Not detected"}</p></div>
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3"><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Composition</p><p className="mt-1 text-sm text-slate-300">{analysis.composition || "Not detected"}</p></div>
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3"><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Camera</p><p className="mt-1 text-sm text-slate-300">{[analysis.camera.shotType, analysis.camera.angle, analysis.camera.framing].filter(Boolean).join(" · ") || "Not detected"}</p></div>
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3"><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Lighting and Shadows</p><p className="mt-1 text-sm text-slate-300">{[analysis.lighting, analysis.shadows].filter(Boolean).join(" · ") || "Not detected"}</p></div>
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3"><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Visual Style</p><p className="mt-1 text-sm text-slate-300">{analysis.visualStyle || "Not detected"}</p></div>
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3"><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Mood and Aesthetic</p><p className="mt-1 text-sm text-slate-300">{[analysis.mood, analysis.overallAesthetic].filter(Boolean).join(" · ") || "Not detected"}</p></div>
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3"><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Objects</p><p className="mt-1 text-sm text-slate-300">{renderList(analysis.objects)}</p></div>
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3"><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Color Palette</p><p className="mt-1 text-sm text-slate-300">{renderList(analysis.colorPalette)}</p></div>
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3 md:col-span-2"><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Appearance and Details</p><p className="mt-1 text-sm text-slate-300">{[analysis.appearanceDetails, renderList(analysis.secondarySubjects), renderList(analysis.importantDetails), renderList(analysis.textInImage)].filter(Boolean).join(" · ")}</p></div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
