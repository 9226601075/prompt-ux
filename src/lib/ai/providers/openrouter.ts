import { AIError } from "../errors";
import { ACCEPTED_IMAGE_TYPES, MAX_IMAGE_BYTES } from "@/lib/imageAnalysis/config";

type OpenRouterMessage = {
  role: "system" | "user";
  content: string | Array<{ type: "text"; text: string } | { type: "image_url"; image_url: { url: string } }>;
};

const OPENROUTER_TIMEOUT_MS = 30_000;
const IMAGE_DATA_URL_PATTERN = new RegExp(`^data:(?:${ACCEPTED_IMAGE_TYPES.join("|")});base64,([A-Za-z0-9+/]+=*)$`);

export type OpenRouterResponse = {
  content: string;
  model: string;
};

function getApiKey(): string {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new AIError("AI_CONFIGURATION", "OpenRouter API key is not configured.", 503);
  return apiKey;
}

async function requestOpenRouter(
  modelId: string,
  messages: OpenRouterMessage[],
  temperature = 0.7,
  requestId?: string,
): Promise<OpenRouterResponse> {
  const imageIncluded = messages.some((message) => Array.isArray(message.content)
    && message.content.some((part) => part.type === "image_url" && Boolean(part.image_url.url)));

  if (imageIncluded) {
    const imagePart = messages.flatMap((message) => Array.isArray(message.content) ? message.content : [])
      .find((part) => part.type === "image_url");
    const match = imagePart?.type === "image_url" ? IMAGE_DATA_URL_PATTERN.exec(imagePart.image_url.url) : null;
    const base64 = match?.[1] ?? "";
    const padding = base64.endsWith("==") ? 2 : base64.endsWith("=") ? 1 : 0;
    const byteLength = Math.floor(base64.length * 3 / 4) - padding;
    if (!match || byteLength <= 0 || byteLength > MAX_IMAGE_BYTES) {
      throw new AIError("AI_INVALID_REQUEST", "The image payload is invalid or empty.", 400);
    }
  }

  console.info(`[OpenRouter] requestId=${requestId ?? "none"} model=${modelId} imageIncluded=${imageIncluded}`);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), OPENROUTER_TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getApiKey()}`,
        "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
        "X-Title": "Prompt UX",
      },
      body: JSON.stringify({ model: modelId, messages, temperature }),
      signal: controller.signal,
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new AIError("AI_TIMEOUT", "Image analysis timed out.", 504);
    }
    throw new AIError("AI_PROVIDER_FAILURE", "Image analysis is temporarily unavailable.", 503);
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    await response.body?.cancel();
    const status = response.status;
    console.error(`[OpenRouter] requestId=${requestId ?? "none"} request failed status=${status} model=${modelId} imageIncluded=${imageIncluded}`);
    if (status === 401 || status === 403) {
      throw new AIError("AI_CONFIGURATION", "The image analysis service is not configured.", 503);
    }
    if (status >= 400 && status < 500) {
      throw new AIError("AI_INVALID_REQUEST", "The image analysis request was rejected.", 400);
    }
    throw new AIError("AI_PROVIDER_FAILURE", "Image analysis is temporarily unavailable.", 503);
  }

  let data: {
    model?: string;
    choices?: Array<{ message?: { content?: string | Array<{ text?: string }> } }>;
  };
  try {
    data = await response.json() as typeof data;
  } catch {
    throw new AIError("AI_PROVIDER_FAILURE", "Image analysis is temporarily unavailable.", 503);
  }
  const content = data.choices?.[0]?.message?.content;
  const text = typeof content === "string"
    ? content.trim()
    : Array.isArray(content)
      ? content.map((item) => item.text ?? "").join(" ").trim()
      : "";

  console.info(`[OpenRouter] requestId=${requestId ?? "none"} response status=${response.status} model=${modelId} resolvedModel=${data.model ?? "metadata-missing"} imageIncluded=${imageIncluded} contentPresent=${Boolean(text)}`);

  if (!text) throw new AIError("AI_PROVIDER_FAILURE", "OpenRouter returned an empty response.", 502);
  return { content: text, model: data.model ?? modelId };
}

export async function callOpenRouter(
  modelId: string,
  messages: OpenRouterMessage[],
  temperature = 0.7,
  requestId?: string,
): Promise<string> {
  const response = await requestOpenRouter(modelId, messages, temperature, requestId);
  return response.content;
}

export async function callOpenRouterWithMetadata(
  modelId: string,
  messages: OpenRouterMessage[],
  temperature = 0.7,
  requestId?: string,
): Promise<OpenRouterResponse> {
  return requestOpenRouter(modelId, messages, temperature, requestId);
}