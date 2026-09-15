import { NextRequest, NextResponse } from "next/server";
import { callProvider, getAvailableModels } from "@/lib/aiProviders";
import { optimizePromptLocally, type PromptModeId } from "@/lib/promptOptimizer";
import { INPUT_LANGUAGE_AUTO, type LanguageId, type LanguageSelection } from "@/lib/languageConfig";
import { detectInputLanguage, isLanguageId } from "@/lib/languageSupport";
import { AIError } from "@/lib/ai/errors";
import { PromptPipelineEngine } from "@/lib/pipeline/engine";
import { createDefaultPipelineLayers } from "@/lib/pipeline/registry";
import { normalizeImageAnalysis, type ImageAnalysisResult } from "@/lib/imageAnalysis/types";
import { synthesizeImagePrompt } from "@/lib/imageAnalysis/synthesizeImagePrompt";

type GenerateRequestBody = {
  idea?: string;
  model?: string;
  modelSelectionMode?: "auto" | "manual";
  selectedModelId?: string;
  useDemoMode?: boolean;
  mode?: PromptModeId;
  inputLanguage?: LanguageSelection;
  outputLanguage?: LanguageId;
  outputStyle?: string;
  imageAnalysis?: ImageAnalysisResult;
};

function isDemoFallbackError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  const lower = message.toLowerCase();

  if (lower.includes("api key") || lower.includes("configured")) {
    return true;
  }

  if (
    lower.includes("credit") ||
    lower.includes("quota") ||
    lower.includes("insufficient")
  ) {
    return true;
  }

  if (
    lower.includes("network") ||
    lower.includes("econnrefused") ||
    lower.includes("socket")
  ) {
    return true;
  }

  if (lower.includes("openrouter request failed:")) {
    return /(401|402|403|429|500|502|503|504)/.test(lower);
  }

  return false;
}

function buildDemoResponse(idea: string, mode: PromptModeId, outputLanguage: LanguageId, outputStyle: string, providerError?: string) {
  const result = optimizePromptLocally(idea, mode);

  return {
    ...result,
    demoMode: true,
    modelUsed: "local-demo",
    provider: "local",
    fallbackUsed: false,
    providerError,
    mode,
  };
}

export async function GET() {
  return NextResponse.json({ models: getAvailableModels() });
}

export async function POST(request: NextRequest) {
  const requestId = crypto.randomUUID();
  console.info(`[ImagePrompt] requestId=${requestId} stage=generation`);

  let body: GenerateRequestBody;

  try {
    const parsedBody: unknown = await request.json();
    if (!parsedBody || typeof parsedBody !== "object" || Array.isArray(parsedBody)) {
      throw new Error("Request body must be an object.");
    }
    body = parsedBody as GenerateRequestBody;
  } catch {
    return NextResponse.json(
      { error: "Invalid request body.", requestId },
      { status: 400 },
    );
  }

  let normalizedImageAnalysis: ImageAnalysisResult | undefined;
  if (body.imageAnalysis !== undefined && body.imageAnalysis !== null) {
    try {
      normalizedImageAnalysis = normalizeImageAnalysis(body.imageAnalysis);
    } catch {
      return NextResponse.json({ error: "The image analysis is incomplete or malformed.", code: "AI_INVALID_RESPONSE", requestId }, { status: 422 });
    }
  }

  const idea = body.idea;
  const modelSelectionMode = body.modelSelectionMode ?? (body.model ? "manual" : "auto");
  const model = modelSelectionMode === "manual" ? body.selectedModelId ?? body.model : undefined;
  const useDemoMode = body.useDemoMode === true;
  const mode = body.mode ?? "professional";
  const inputSelection: LanguageSelection = body.inputLanguage === INPUT_LANGUAGE_AUTO || isLanguageId(body.inputLanguage)
    ? body.inputLanguage
    : INPUT_LANGUAGE_AUTO;
  const outputLanguage = isLanguageId(body.outputLanguage) ? body.outputLanguage : "english";
  const imageContext = normalizedImageAnalysis
    ? `Uploaded image analysis:\n${JSON.stringify(normalizedImageAnalysis, null, 2)}`
    : "";
  const combinedIdea = [typeof idea === "string" ? idea.trim() : "", imageContext]
    .filter(Boolean)
    .join("\n\n");

  if (!combinedIdea) {
    return NextResponse.json(
      { error: "A non-empty idea is required.", requestId },
      { status: 400 },
    );
  }

  if (normalizedImageAnalysis) {
    const imagePrompt = synthesizeImagePrompt(normalizedImageAnalysis);
    if (!imagePrompt) {
      return NextResponse.json({ error: "The image analysis is incomplete or malformed.", code: "AI_INVALID_RESPONSE", requestId }, { status: 422 });
    }

    console.info(`[ImagePrompt] requestId=${requestId} stage=generation status=success source=structured-analysis`);

    return NextResponse.json({
      prompt: imagePrompt,
      analysis: {
        intent: "create",
        category: "general",
        role: "image generation model",
        template: "Image Generation Prompt",
        addedContext: [],
      },
      score: {
        score: 90,
        grade: "Excellent",
        explanation: ["Generated directly from the structured image analysis."],
      },
      missingInfo: {
        missingItems: [],
        suggestions: [],
        isComplete: true,
        message: "The image prompt is ready to use.",
      },
      demoMode: false,
      modelUsed: "structured-image-analysis",
      provider: "local",
      fallbackUsed: false,
      mode,
      inputLanguage: "english",
      outputLanguage,
      outputStyle: body.outputStyle ?? "professional",
      requestId,
    });
  }

  if (modelSelectionMode !== "auto" && modelSelectionMode !== "manual") {
    return NextResponse.json({ error: "Invalid model selection mode.", code: "AI_INVALID_REQUEST", requestId }, { status: 400 });
  }

  if (modelSelectionMode === "manual" && !model) {
    return NextResponse.json({ error: "A model must be selected in manual mode.", code: "AI_INVALID_REQUEST", requestId }, { status: 400 });
  }

  const trimmedIdea = combinedIdea;
  const detected = detectInputLanguage(trimmedIdea, inputSelection);

  if (useDemoMode) {
    return NextResponse.json({
      ...buildDemoResponse(trimmedIdea, mode, outputLanguage, body.outputStyle ?? "professional"),
      inputLanguage: detected.language,
      outputLanguage,
      outputStyle: body.outputStyle ?? "professional",
    });
  }

  try {
    const pipeline = await new PromptPipelineEngine(createDefaultPipelineLayers()).run(trimmedIdea);
    const response = await callProvider(model, pipeline.finalPrompt, mode, detected.language, outputLanguage, body.outputStyle);
    return NextResponse.json({ ...response, demoMode: false, mode, inputLanguage: detected.language, outputLanguage, outputStyle: body.outputStyle ?? "professional" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";

    if (error instanceof AIError && error.code === "AI_INVALID_REQUEST") {
      return NextResponse.json({ error: message, code: error.code }, { status: error.status });
    }

    if (isDemoFallbackError(error)) {
      if (process.env.NODE_ENV === "development") {
        console.info(`[generate] Provider unavailable; using local demo fallback. model=${model ?? "default"}`);
      }

      return NextResponse.json({
        ...buildDemoResponse(trimmedIdea, mode, outputLanguage, body.outputStyle ?? "professional", message),
        inputLanguage: detected.language,
        outputLanguage,
        outputStyle: body.outputStyle ?? "professional",
      });
    }

    if (process.env.NODE_ENV === "development") {
      console.error(`[generate] Generation failed. model=${model ?? "default"}`);
    }

    return NextResponse.json(
      {
        error: "Unable to generate a response right now. Please try again shortly.",
        ...(process.env.NODE_ENV === "development" ? { details: message } : {}),
      },
      { status: 500 },
    );
  }
}
