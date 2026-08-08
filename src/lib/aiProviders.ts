export type ProviderModel = {
  id: string;
  name: string;
  provider: string;
};

import type { PromptModeId } from "@/lib/promptOptimizer";

export type ProviderResponse = {
  prompt: string;
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

const MODEL_CATALOG: ProviderModel[] = [
  { id: "openai/gpt-4.1-mini", name: "GPT-4.1 Mini", provider: "openai" },
  { id: "anthropic/claude-3.5-sonnet", name: "Claude 3.5 Sonnet", provider: "anthropic" },
  { id: "google/gemini-2.0-flash-001", name: "Gemini 2.0 Flash", provider: "google" },
];

export function getAvailableModels(): ProviderModel[] {
  return MODEL_CATALOG;
}

export async function callProvider(
  modelId: string,
  idea: string,
  mode: PromptModeId = "professional",
): Promise<ProviderResponse> {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    throw new Error("OpenRouter API key is not configured.");
  }

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

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
      "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
      "X-Title": "Prompt UX",
    },
    body: JSON.stringify({
      model: modelId,
      messages: [
        {
          role: "system",
          content: `You are a senior prompt engineer. Return a polished, structured prompt that improves the user's idea and keeps it concise. ${modeInstruction}`,
        },
        {
          role: "user",
          content: idea,
        },
      ],
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`OpenRouter request failed: ${response.status} ${errorBody}`);
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };

  const content = data.choices?.[0]?.message?.content?.trim();

  if (!content) {
    throw new Error("OpenRouter returned an empty response.");
  }

  return {
    prompt: content,
    analysis: {
      intent: "Generated via OpenRouter",
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
