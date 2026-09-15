export type ProviderModel = {
  id: string;
  name: string;
  provider: string;
  capabilities: readonly string[];
  enabled: boolean;
};

import type { PromptModeId } from "@/lib/promptOptimizer";
import { languageInstruction } from "@/lib/languageSupport";
import type { LanguageId } from "@/lib/languageConfig";
import { generateText } from "@/lib/ai/router";
import { getPromptGenerationModels } from "@/lib/ai/modelRegistry";
import { optimizePromptLocally } from "@/lib/promptOptimizer";

export type ProviderResponse = {
  prompt: string;
  modelUsed: string;
  provider: string;
  fallbackUsed: boolean;
  analysis?: {
    intent: string;
    category: string;
    role: string;
  };
  score?: {
    score: number;
    grade: string;
  };
  missingInfo?: {
    message: string;
    isComplete: boolean;
    missingItems: string[];
    suggestions: string[];
  };
};

export function getAvailableModels(): ProviderModel[] {
  return getPromptGenerationModels().map((model) => ({
    id: model.id,
    name: model.displayName,
    provider: model.provider,
    capabilities: model.capabilities,
    enabled: model.enabled,
  }));
}

export async function callProvider(
  modelId: string | undefined,
  idea: string,
  mode: PromptModeId = "professional",
  inputLanguage: LanguageId = "english",
  outputLanguage: LanguageId = "english",
  outputStyle = "professional",
): Promise<ProviderResponse> {
  const modeInstruction =
    mode === "quick"
      ? "Create a concise prompt that is short and immediately useful."
      : mode === "professional"
      ? "Create a polished prompt that includes context and an output format."
      : mode === "expert"
      ? "Create an expert-level prompt with role, context, constraints, reasoning, structure, and success criteria."
      : mode === "business"
      ? "Create a business-focused prompt that emphasizes audience value, positioning, marketing, and conversion optimization."
      : "Create the most comprehensive prompt possible using advanced prompt engineering techniques.";

  const localOptimization = optimizePromptLocally(
    idea,
    mode,
    outputLanguage,
    outputStyle as "professional" | "simple" | "technical" | "creative",
  );
  const response = await generateText({
    capability: "prompt_optimization",
    modelId,
    systemInstruction: `You are a senior prompt engineer. Return a polished, structured prompt that improves the user's idea and keeps it concise. ${modeInstruction} ${languageInstruction(inputLanguage, outputLanguage, outputStyle)}`,
    userInput: localOptimization.prompt,
    temperature: 0.7,
  });
  const content = response.result.content;

  return {
    prompt: content,
    modelUsed: response.result.modelId,
    provider: response.result.provider,
    fallbackUsed: response.fallbackUsed,
    analysis: {
      intent: `Generated via ${response.result.provider}`,
      category: "AI Assisted",
      role: "Prompt Engineer",
    },
    score: {
      score: 92,
      grade: "A",
    },
    missingInfo: {
      message: "The response is optimized for direct use.",
      isComplete: true,
      missingItems: [],
      suggestions: [],
    },
  };
}
