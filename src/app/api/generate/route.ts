import { NextRequest, NextResponse } from "next/server";
import { callProvider, getAvailableModels } from "@/lib/aiProviders";
import { optimizePromptLocally, type PromptModeId } from "@/lib/promptOptimizer";
import { INPUT_LANGUAGE_AUTO, type LanguageId, type LanguageSelection } from "@/lib/languageConfig";
import { detectInputLanguage, isLanguageId } from "@/lib/languageSupport";

type GenerateRequestBody = {
  idea?: string;
  model?: string;
  useDemoMode?: boolean;
  mode?: PromptModeId;
  inputLanguage?: LanguageSelection;
  outputLanguage?: LanguageId;
  outputStyle?: string;
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
    lower.includes("fetch") ||
    lower.includes("econnrefused") ||
    lower.includes("timeout") ||
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
  const result = optimizePromptLocally(idea, mode, outputLanguage, outputStyle as "professional" | "simple" | "technical" | "creative");

  return {
    ...result,
    demoMode: true,
    providerError,
    mode,
  };
}

export async function GET() {
  return NextResponse.json({ models: getAvailableModels() });
}

export async function POST(request: NextRequest) {
  let body: GenerateRequestBody;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 },
    );
  }

  const idea = body.idea;
  const model = body.model ?? "openai/gpt-4.1-mini";
  const useDemoMode = body.useDemoMode === true;
  const mode = body.mode ?? "professional";
  const inputSelection: LanguageSelection = body.inputLanguage === INPUT_LANGUAGE_AUTO || isLanguageId(body.inputLanguage)
    ? body.inputLanguage
    : INPUT_LANGUAGE_AUTO;
  const outputLanguage = isLanguageId(body.outputLanguage) ? body.outputLanguage : "english";

  if (!idea || typeof idea !== "string" || !idea.trim()) {
    return NextResponse.json(
      { error: "A non-empty idea is required." },
      { status: 400 },
    );
  }

  const trimmedIdea = idea.trim();
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
    const response = await callProvider(model, trimmedIdea, mode, detected.language, outputLanguage, body.outputStyle);
    return NextResponse.json({ ...response, demoMode: false, mode, inputLanguage: detected.language, outputLanguage, outputStyle: body.outputStyle ?? "professional" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";

    if (isDemoFallbackError(error)) {
      console.error("[generate] OpenRouter request failed; using local demo prompt.", {
        message,
        model,
      });

      return NextResponse.json({
        ...buildDemoResponse(trimmedIdea, mode, outputLanguage, body.outputStyle ?? "professional", message),
        inputLanguage: detected.language,
        outputLanguage,
        outputStyle: body.outputStyle ?? "professional",
      });
    }

    return NextResponse.json(
      {
        error: "Unable to generate a response right now. Please try again shortly.",
      },
      { status: 500 },
    );
  }
}
