"use client";

import { useEffect, useRef, useState } from "react";
import type {
  MissingInformation,
  PromptAnalysis,
  PromptScore,
  PromptVersion,
} from "@/lib/promptOptimizer";
import type { PromptSearchResult } from "@/lib/promptSearch";
import { SmartAutocomplete } from "@/components/SmartAutocomplete";
import {
  PROMPT_MODE_OPTIONS,
  buildRefinedPromptVersion,
  type PromptModeId,
} from "@/lib/promptOptimizer";
import { exportPrompt, type ExportFormat } from "@/lib/exportPrompt";
import { PromptPipelineEngine } from "@/lib/pipeline/engine";
import { createDefaultPipelineLayers } from "@/lib/pipeline/registry";
import type { PipelineRunResult } from "@/lib/pipeline/types";
import { createPromptValidator } from "@/lib/pipeline/validation/registry";
import type { ValidationResult } from "@/lib/pipeline/validation/types";
import Link from "next/link";
import { saveGeneratedPrompt } from "@/lib/workspace/savePrompt";

export default function PromptOptimizer() {
  const [idea, setIdea] = useState("");
  const [result, setResult] = useState("");
  const [analysis, setAnalysis] = useState<PromptAnalysis | null>(null);
  const [score, setScore] = useState<PromptScore | null>(null);
  const [missingInfo, setMissingInfo] = useState<MissingInformation | null>(null);
  const [error, setError] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [useDemoMode, setUseDemoMode] = useState(true);
  const [demoMode, setDemoMode] = useState(false);
  const [selectedMode, setSelectedMode] = useState<PromptModeId>("professional");
  const [versions, setVersions] = useState<PromptVersion[]>([]);
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(null);
  const [isRefining, setIsRefining] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [exportMessage, setExportMessage] = useState("");
  const [showPipeline, setShowPipeline] = useState(true);
  const [pipelineResult, setPipelineResult] = useState<PipelineRunResult | null>(null);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const exportButtonRef = useRef<HTMLDivElement | null>(null);

  const selectedVersion = versions.find((version) => version.id === selectedVersionId) ?? null;
  const bestVersionScore = versions.reduce(
    (bestScore, version) => Math.max(bestScore, version.score.score),
    0,
  );

  useEffect(() => {
    if (!exportMessage) return;

    const timeout = window.setTimeout(() => setExportMessage(""), 2200);
    return () => window.clearTimeout(timeout);
  }, [exportMessage]);

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (exportButtonRef.current && !exportButtonRef.current.contains(event.target as Node)) {
        setIsExportOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  function applyVersion(version: PromptVersion) {
    setResult(version.prompt);
    setAnalysis(version.analysis);
    setScore(version.score);
    setMissingInfo(version.missingInfo);
    setSelectedVersionId(version.id);
  }

  async function handleGenerate() {
    if (!idea.trim()) return;

    setIsGenerating(true);
    setCopied(false);
    setError("");
    setResult("");
    setAnalysis(null);
    setScore(null);
    setMissingInfo(null);
    setVersions([]);
    setSelectedVersionId(null);
    setPipelineResult(null);
    setValidationResult(null);
    setDemoMode(false);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea: idea.trim(), useDemoMode, mode: selectedMode }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        return;
      }

      const pipelineEngine = new PromptPipelineEngine(createDefaultPipelineLayers());
      const pipeline = await pipelineEngine.run(idea.trim());
      const validator = createPromptValidator();
      const validation = validator.validate(pipeline.finalPrompt);
      const initialPrompt = pipeline.finalPrompt;

      const initialVersion: PromptVersion = {
        id: "version-1",
        versionNumber: 1,
        prompt: initialPrompt,
        analysis:
          data.analysis ?? {
            intent: "general",
            category: "general",
            role: "a highly capable assistant",
            template: "Generated Prompt",
            addedContext: [],
          },
        score:
          data.score ?? {
            score: 60,
            grade: "Needs Improvement",
            explanation: ["The prompt was generated successfully."],
          },
        missingInfo:
          data.missingInfo ?? {
            missingItems: [],
            suggestions: [],
            isComplete: true,
            message: "The prompt is ready to review.",
          },
        improvements: [
          "Clear objective and structure",
          "Added contextual framing",
          "Improved output guidance",
        ],
      };

      setPipelineResult(pipeline);
      setValidationResult(validation);
      setVersions([initialVersion]);
      applyVersion(initialVersion);
      setDemoMode(Boolean(data.demoMode));

      saveGeneratedPrompt({
        title: idea.trim().slice(0, 48) || "Generated Prompt",
        content: initialPrompt,
        category: initialVersion.analysis.category,
        promptMode: PROMPT_MODE_OPTIONS.find((mode) => mode.id === selectedMode)?.label ?? selectedMode,
        score: initialVersion.score.score,
        source: demoMode ? "demo" : "engine",
      });
    } catch {
      setError("Failed to reach the server. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleRefine() {
    if (!idea.trim() || !selectedVersion || isRefining) return;

    setIsRefining(true);
    setCopied(false);
    setError("");

    try {
      const nextVersion = buildRefinedPromptVersion({
        idea: idea.trim(),
        mode: selectedMode,
        previousPrompt: selectedVersion.prompt,
        previousAnalysis: selectedVersion.analysis,
        versionNumber: versions.length + 1,
      });

      const nextVersions = [...versions, nextVersion];
      setVersions(nextVersions);
      applyVersion(nextVersion);

      saveGeneratedPrompt({
        title: idea.trim().slice(0, 48) || "Refined Prompt",
        content: nextVersion.prompt,
        category: nextVersion.analysis.category,
        promptMode: PROMPT_MODE_OPTIONS.find((mode) => mode.id === selectedMode)?.label ?? selectedMode,
        score: nextVersion.score.score,
        source: demoMode ? "demo" : "engine",
      });
    } catch {
      setError("Failed to refine the prompt. Please try again.");
    } finally {
      setIsRefining(false);
    }
  }

  async function handleCopy() {
    if (!result) return;
    try {
      await exportPrompt("copy", {
        category: analysis?.category ?? "general",
        provider: demoMode ? "Demo Mode" : "OpenRouter",
        mode: PROMPT_MODE_OPTIONS.find((mode) => mode.id === selectedMode)?.label ?? selectedMode,
        score: score?.score ?? 0,
        prompt: result,
        createdAt: new Date().toISOString(),
        grade: score?.grade,
      });
      setCopied(true);
      setExportMessage("Prompt copied successfully.");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Clipboard access is unavailable. Please try another export option.");
    }
  }

  async function handleExport(format: ExportFormat) {
    if (!result) return;

    try {
      await exportPrompt(format, {
        category: analysis?.category ?? "general",
        provider: demoMode ? "Demo Mode" : "OpenRouter",
        mode: PROMPT_MODE_OPTIONS.find((mode) => mode.id === selectedMode)?.label ?? selectedMode,
        score: score?.score ?? 0,
        prompt: result,
        createdAt: new Date().toISOString(),
        grade: score?.grade,
      });

      if (format === "copy") {
        setExportMessage("Prompt copied successfully.");
      } else {
        setExportMessage(`${format.toUpperCase()} export started.`);
      }
      setIsExportOpen(false);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Export failed.");
      setIsExportOpen(false);
    }
  }

  function handleSuggestionSelect(template: PromptSearchResult) {
    setIdea(template.starterPrompt);
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-violet-600/20 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-indigo-500/10 blur-3xl" />
      </div>

      <main className="relative mx-auto flex min-h-screen max-w-3xl flex-col px-6 py-16 sm:px-8 sm:py-24">
        <header className="mb-10 text-center">
          <div className="mb-4 inline-flex flex-wrap items-center justify-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-1.5 text-sm text-violet-300">
            <span className="inline-flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-violet-400" />
              Smart Prompt Engine
            </span>
            <Link
              href="/workspace"
              className="rounded-full border border-violet-400/30 bg-slate-950/60 px-3 py-1 text-xs font-semibold text-violet-200 transition-colors hover:bg-slate-900"
            >
              Open My Workspace
            </Link>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
            AI Prompt Optimiser
          </h1>
          <p className="mt-4 text-base text-slate-400 sm:text-lg">
            Describe your goal and let the autocomplete surface the right prompt instantly.
          </p>
        </header>

        <div className="flex flex-1 flex-col gap-6">
          <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-2xl shadow-black/30 backdrop-blur-xl">
            <SmartAutocomplete
              value={idea}
              onChange={setIdea}
              onSelect={handleSuggestionSelect}
              placeholder="Try: create a launch plan for an AI startup..."
            />

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setUseDemoMode((value) => !value)}
                className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
                  useDemoMode
                    ? "border-amber-500/30 bg-amber-500/10 text-amber-200"
                    : "border-emerald-500/20 bg-emerald-500/10 text-emerald-200"
                }`}
              >
                <span
                  className={`h-2.5 w-2.5 rounded-full ${
                    useDemoMode ? "bg-amber-400" : "bg-emerald-400"
                  }`}
                />
                {useDemoMode ? "Demo Mode On" : "Real API Mode"}
              </button>

              <p className="text-xs text-slate-400">
                {useDemoMode
                  ? "Local demo prompts are active for development."
                  : "The live OpenRouter API will be attempted first."}
              </p>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {PROMPT_MODE_OPTIONS.map((mode) => {
                const isActive = selectedMode === mode.id;

                return (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => setSelectedMode(mode.id)}
                    className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
                      isActive
                        ? "border-violet-500/40 bg-violet-500/15 text-violet-200"
                        : "border-slate-700 bg-slate-950/50 text-slate-300 hover:border-slate-600"
                    }`}
                  >
                    {mode.label}
                  </button>
                );
              })}
            </div>

            <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-950/50 px-3 py-1.5 text-sm text-slate-300">
              <span className="text-slate-500">Selected mode:</span>
              <span className="font-semibold text-white">
                {PROMPT_MODE_OPTIONS.find((mode) => mode.id === selectedMode)?.label}
              </span>
            </div>

            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                onClick={handleGenerate}
                disabled={!idea.trim() || isGenerating}
                className="mt-2 w-full rounded-xl bg-violet-600 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-40 sm:mt-0 sm:w-auto"
              >
                {isGenerating ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Generating...
                  </span>
                ) : (
                  "Generate Prompt"
                )}
              </button>
            </div>

            

          {error && (
            <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          {result && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl backdrop-blur-sm">
              <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-medium text-slate-300">
                      Optimized Prompt
                    </h2>
                    <div className="flex items-center gap-2">
                      <span className="rounded-full border border-slate-700 bg-slate-950/50 px-3 py-1 text-xs text-slate-300">
                        {PROMPT_MODE_OPTIONS.find((mode) => mode.id === selectedMode)?.label}
                      </span>
                      {demoMode && (
                        <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-200">
                          Demo Mode
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {versions.map((version) => {
                      const isActive = selectedVersion?.id === version.id;
                      const isBestVersion =
                        version.score.score === bestVersionScore && bestVersionScore > 0;

                      return (
                        <button
                          key={version.id}
                          type="button"
                          onClick={() => applyVersion(version)}
                          className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                            isActive
                              ? "border-violet-500/40 bg-violet-500/15 text-violet-200"
                              : "border-slate-700 bg-slate-950/50 text-slate-300 hover:border-slate-600"
                          }`}
                        >
                          Version {version.versionNumber}
                          {isBestVersion ? " • Best" : ""}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={handleRefine}
                    disabled={isRefining || !idea.trim()}
                    className="rounded-lg border border-violet-500/30 bg-violet-500/10 px-3 py-1.5 text-xs font-semibold text-violet-200 transition-colors hover:border-violet-400 hover:bg-violet-500/20 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {isRefining ? "Refining..." : "Improve Prompt"}
                  </button>
                  <div className="relative" ref={exportButtonRef}>
                    <button
                      type="button"
                      onClick={() => setIsExportOpen((value) => !value)}
                      className="rounded-lg border border-slate-700 bg-slate-950/50 px-3 py-1.5 text-xs font-medium text-slate-300 transition-colors hover:border-slate-600 hover:text-slate-100"
                    >
                      Export
                    </button>

                    {isExportOpen && (
                      <div className="absolute right-0 z-20 mt-2 w-56 rounded-2xl border border-slate-700 bg-slate-900/95 p-2 shadow-2xl shadow-black/40 backdrop-blur-xl">
                        <button
                          type="button"
                          onClick={() => handleExport("copy")}
                          className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-slate-200 transition-colors hover:bg-slate-800"
                        >
                          <span>📋</span>
                          <span>Copy to Clipboard</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleExport("txt")}
                          className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-slate-200 transition-colors hover:bg-slate-800"
                        >
                          <span>📝</span>
                          <span>Download as TXT</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleExport("markdown")}
                          className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-slate-200 transition-colors hover:bg-slate-800"
                        >
                          <span>📄</span>
                          <span>Download as Markdown</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleExport("json")}
                          className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-slate-200 transition-colors hover:bg-slate-800"
                        >
                          <span>🧩</span>
                          <span>Download as JSON</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleExport("print")}
                          className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-slate-200 transition-colors hover:bg-slate-800"
                        >
                          <span>🖨️</span>
                          <span>Print Prompt</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {selectedVersion && (
                <div className="mb-4 rounded-2xl border border-slate-800 bg-slate-950/50 p-4">
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <div className="text-sm font-semibold text-white">
                      Version {selectedVersion.versionNumber} improvements
                    </div>
                    {selectedVersion.score.score === bestVersionScore && bestVersionScore > 0 && (
                      <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-200">
                        Best Version
                      </span>
                    )}
                  </div>
                  <ul className="space-y-2 text-sm text-slate-300">
                    {selectedVersion.improvements.map((improvement, index) => (
                      <li key={`${selectedVersion.id}-${index}`} className="flex items-start gap-2">
                        <span className="mt-1 text-violet-400">•</span>
                        <span>{improvement}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-3">
                <div className="flex flex-wrap gap-2 text-xs text-slate-400">
                  <span className="rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1">
                    Final Prompt
                  </span>
                  <span className="rounded-full border border-slate-700 bg-slate-950/50 px-3 py-1">
                    Quality Score: {pipelineResult?.qualityScore ?? score?.score ?? 0}
                  </span>
                  <span className="rounded-full border border-slate-700 bg-slate-950/50 px-3 py-1">
                    Universe AI Compatibility: {pipelineResult?.compatibilityScore ?? 0}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPipeline((value) => !value)}
                  className="rounded-full border border-slate-700 bg-slate-900/70 px-3 py-1.5 text-xs font-medium text-slate-300"
                >
                  {showPipeline ? "Hide Pipeline" : "Show Pipeline"}
                </button>
              </div>

              {pipelineResult && showPipeline && (
                <div className="mb-4 rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div className="text-sm font-semibold text-white">Prompt Pipeline</div>
                    <div className="text-xs text-slate-400">10 logical filtering layers</div>
                  </div>
                  <div className="space-y-3">
                    {pipelineResult.layers.map((layer, index) => (
                      <details key={layer.id} className="rounded-xl border border-slate-800 bg-slate-900/70 p-3" open={index === 0}>
                        <summary className="cursor-pointer text-sm font-medium text-slate-200">
                          {index + 1}. {layer.name}
                        </summary>
                        <div className="mt-3 space-y-2 text-sm text-slate-300">
                          <p>{layer.summary}</p>
                          <pre className="whitespace-pre-wrap rounded-lg border border-slate-800 bg-slate-950/50 p-3 font-mono text-xs leading-relaxed text-slate-400">
                            {layer.output}
                          </pre>
                        </div>
                      </details>
                    ))}
                  </div>
                </div>
              )}

              {analysis && (
                <div className="mb-4 flex flex-wrap gap-2 text-xs text-slate-400">
                  <span className="rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1">
                    Intent: {analysis.intent}
                  </span>
                  <span className="rounded-full border border-slate-700 bg-slate-950/50 px-3 py-1">
                    Category: {analysis.category}
                  </span>
                  <span className="rounded-full border border-slate-700 bg-slate-950/50 px-3 py-1">
                    Role: {analysis.role}
                  </span>
                </div>
              )}

              {missingInfo && (
                <div className="mb-4 rounded-2xl border border-slate-700 bg-slate-950/50 p-4 text-sm text-slate-200">
                  <div className="mb-3 flex items-center justify-between gap-4">
                    <div>
                      <div className="font-semibold text-slate-100">Missing Information</div>
                      <p className="text-xs text-slate-400">{missingInfo.message}</p>
                    </div>
                  </div>

                  {missingInfo.isComplete ? (
                    <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
                      Your prompt is already well-defined.
                    </div>
                  ) : (
                    <>
                      <div className="mb-3 text-slate-300">Important missing items:</div>
                      <ul className="list-disc space-y-2 pl-5 text-slate-300">
                        {missingInfo.missingItems.map((item, index) => (
                          <li key={index}>{item}</li>
                        ))}
                      </ul>

                      <div className="mt-4 text-slate-300">Suggestions to improve the request:</div>
                      <ul className="list-disc space-y-2 pl-5 text-slate-300">
                        {missingInfo.suggestions.map((item, index) => (
                          <li key={index}>{item}</li>
                        ))}
                      </ul>
                    </>
                  )}
                </div>
              )}

              {exportMessage && (
                <div className="mb-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
                  {exportMessage}
                </div>
              )}

              {pipelineResult && (
                <div className="mb-4 rounded-2xl border border-violet-500/20 bg-violet-500/10 px-4 py-3 text-sm text-violet-100">
                  <div className="font-semibold">Improve Summary</div>
                  <p className="mt-1 whitespace-pre-wrap text-sm text-violet-100/90">
                    {pipelineResult.summary}
                  </p>
                </div>
              )}

              {validationResult && (
                <div className="mb-4 rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold text-white">Validation Results</div>
                      <div className="text-xs text-slate-400">Overall score: {validationResult.overallScore}/100</div>
                    </div>
                    <div className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-200">
                      {validationResult.overallScore >= 80 ? "Approved" : "Needs Improvement"}
                    </div>
                  </div>

                  <div className="grid gap-3 md:grid-cols-2">
                    {validationResult.criteria.map((criterion) => (
                      <div key={criterion.name} className="rounded-xl border border-slate-800 bg-slate-900/70 p-3">
                        <div className="mb-2 flex items-center justify-between gap-3">
                          <div className="text-sm font-medium text-slate-200">{criterion.name}</div>
                          <div className="text-sm font-semibold text-white">{criterion.score}/100</div>
                        </div>
                        <p className="text-sm text-slate-400">{criterion.summary}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3">
                      <div className="mb-2 text-sm font-semibold text-emerald-200">Strengths</div>
                      <ul className="space-y-2 text-sm text-emerald-100/90">
                        {validationResult.strengths.map((strength) => (
                          <li key={strength}>• {strength}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-3">
                      <div className="mb-2 text-sm font-semibold text-amber-200">Weaknesses</div>
                      <ul className="space-y-2 text-sm text-amber-100/90">
                        {validationResult.weaknesses.map((weakness) => (
                          <li key={weakness}>• {weakness}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {validationResult.suggestedImprovements.length > 0 && (
                    <div className="mt-4 rounded-xl border border-slate-800 bg-slate-900/70 p-3">
                      <div className="mb-2 text-sm font-semibold text-white">Suggested Improvements</div>
                      <ul className="space-y-2 text-sm text-slate-300">
                        {validationResult.suggestedImprovements.map((suggestion) => (
                          <li key={suggestion}>• {suggestion}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {score && (
                <div className="mb-4 rounded-2xl border px-4 py-3 text-sm font-semibold text-white"
                  style={{
                    backgroundColor:
                      score.score >= 90
                        ? "#166534"
                        : score.score >= 70
                        ? "#7c3aed"
                        : "#b91c1c",
                  }}
                >
                  <div className="flex items-center justify-between gap-4">
                    <span>Prompt Score: {score.score} / 100</span>
                    <span>{score.grade}</span>
                  </div>
                </div>
              )}

              <pre className="whitespace-pre-wrap rounded-xl border border-slate-800 bg-slate-950/50 p-4 font-mono text-sm leading-relaxed text-slate-300">
                {result}
              </pre>
            </div>
          )}
        </div>
      </div>

        

        <footer className="mt-16 text-center text-xs text-slate-600">
          Built with Next.js & Tailwind CSS
        </footer>
      </main>
    </div>
  );
}
