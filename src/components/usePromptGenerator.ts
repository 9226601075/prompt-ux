"use client";

import { useEffect, useState } from "react";
import type {
  MissingInformation,
  PromptAnalysis,
  PromptScore,
  PromptVersion,
} from "@/lib/promptOptimizer";
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
import type { ImageAnalysisResult } from "@/lib/imageAnalysis/types";

export function usePromptGenerator({
  idea,
  imageAnalysis,
  selectedMode,
  useDemoMode,
}: {
  idea: string;
  imageAnalysis: ImageAnalysisResult | null;
  selectedMode: PromptModeId;
  useDemoMode: boolean;
}) {
  const [result, setResult] = useState("");
  const [analysis, setAnalysis] = useState<PromptAnalysis | null>(null);
  const [score, setScore] = useState<PromptScore | null>(null);
  const [missingInfo, setMissingInfo] = useState<MissingInformation | null>(null);
  const [generationError, setGenerationError] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [demoMode, setDemoMode] = useState(false);
  const [versions, setVersions] = useState<PromptVersion[]>([]);
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(null);
  const [isRefining, setIsRefining] = useState(false);
  const [exportMessage, setExportMessage] = useState("");
  const [showPipeline, setShowPipeline] = useState(true);
  const [pipelineResult, setPipelineResult] = useState<PipelineRunResult | null>(null);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);

  const generationInput = [
    idea.trim(),
    imageAnalysis ? `Uploaded image analysis:\n${JSON.stringify(imageAnalysis, null, 2)}` : "",
  ].filter(Boolean).join("\n\n");
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

  function applyVersion(version: PromptVersion) {
    setResult(version.prompt);
    setAnalysis(version.analysis);
    setScore(version.score);
    setMissingInfo(version.missingInfo);
    setSelectedVersionId(version.id);
  }

  async function handleGenerate() {
    if (!generationInput || isGenerating) return;

    setIsGenerating(true);
    setCopied(false);
    setGenerationError("");
    setDemoMode(false);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea: idea.trim(), useDemoMode, mode: selectedMode, imageAnalysis }),
      });

      const data = await response.json();

      if (!response.ok) {
        setGenerationError(data.error ?? "Something went wrong. Please try again.");
        return;
      }

      const pipelineEngine = new PromptPipelineEngine(createDefaultPipelineLayers());
      const pipeline = await pipelineEngine.run(generationInput);
      const validator = createPromptValidator();
      const validation = validator.validate(pipeline.finalPrompt);
      const initialPrompt = data.prompt ?? pipeline.finalPrompt;

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
    } catch {
      setGenerationError("Failed to reach the server. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleRefine() {
    if (!idea.trim() || !selectedVersion || isRefining) return;

    setIsRefining(true);
    setCopied(false);
    setGenerationError("");

    try {
      const nextVersion = buildRefinedPromptVersion({
        idea: idea.trim(),
        mode: selectedMode,
        previousPrompt: selectedVersion.prompt,
        versionNumber: versions.length + 1,
      });

      const nextVersions = [...versions, nextVersion];
      setVersions(nextVersions);
      applyVersion(nextVersion);
    } catch {
      setGenerationError("Failed to refine the prompt. Please try again.");
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
      setGenerationError("Clipboard access is unavailable. Please try another export option.");
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

      setExportMessage(format === "copy" ? "Prompt copied successfully." : `${format.toUpperCase()} export started.`);
    } catch (exportError) {
      setGenerationError(exportError instanceof Error ? exportError.message : "Export failed.");
    }
  }

  return {
    result,
    analysis,
    score,
    missingInfo,
    generationError,
    isGenerating,
    copied,
    demoMode,
    versions,
    selectedVersion,
    bestVersionScore,
    isRefining,
    exportMessage,
    showPipeline,
    pipelineResult,
    validationResult,
    generationInput,
    setShowPipeline,
    applyVersion,
    handleGenerate,
    handleRefine,
    handleCopy,
    handleExport,
  };
}
