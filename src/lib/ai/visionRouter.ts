import { AIError } from "./errors";
import { getModelById } from "./modelRegistry";
import { callOpenRouterWithMetadata } from "./providers/openrouter";
import { IMAGE_ANALYSIS_MODEL } from "../imageAnalysis/config";
import type { AnalyzeImageRequest, ModelSelection } from "./types";

export type VisionAnalysisResponse = {
  content: string;
  modelId: string;
  provider: string;
  fallbackUsed: boolean;
};

export function getVisionSelections(requestedModelId?: string): ModelSelection[] {
  const model = getModelById(IMAGE_ANALYSIS_MODEL);
  if (!model || !model.enabled || model.apiModelId !== IMAGE_ANALYSIS_MODEL
    || !model.supportsVision || !model.supportsImageAnalysis) {
    throw new AIError("AI_NO_CAPABLE_MODEL", "The configured image-analysis model is unavailable.", 503);
  }

  if (requestedModelId && requestedModelId !== IMAGE_ANALYSIS_MODEL) {
    console.warn(`[Vision Router] ignoring non-allowlisted requested model=${requestedModelId}`);
  }

  return [{ capability: "image_analysis", requestedModelId: IMAGE_ANALYSIS_MODEL, model }];
}

function shouldRetry(error: unknown) {
  return error instanceof AIError && (error.code === "AI_PROVIDER_FAILURE" || error.code === "AI_TIMEOUT")
    && (error.status === 502 || error.status === 503 || error.status === 504);
}

export async function routeImageAnalysis(request: AnalyzeImageRequest): Promise<{
  result: VisionAnalysisResponse;
  selection: ModelSelection;
  fallbackUsed: boolean;
}> {
  const selections = getVisionSelections(request.modelId);

  if (selections.length === 0) {
    throw new AIError("AI_NO_CAPABLE_MODEL", "No vision-capable AI model is currently available.", 503);
  }

  let lastError: unknown;

  const selection = selections[0];
  const model = selection.model;
  const messages = [
    { role: "system" as const, content: request.systemInstruction },
    {
      role: "user" as const,
      content: [
        { type: "text" as const, text: request.userInstruction },
        { type: "image_url" as const, image_url: { url: request.imageDataUrl } },
      ],
    },
  ];

  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      console.info(`[Vision Router] requestId=${request.requestId ?? "none"} model=${IMAGE_ANALYSIS_MODEL} imageIncluded=true retry=${attempt > 0}`);
      const response = await callOpenRouterWithMetadata(IMAGE_ANALYSIS_MODEL, messages, request.temperature, request.requestId);

      if (response.model !== IMAGE_ANALYSIS_MODEL) {
        throw new AIError("AI_MODEL_UNAVAILABLE", "The configured image-analysis model was not used.", 502);
      }

      request.validateContent?.(response.content);

      console.info(`[Vision Router] model=${IMAGE_ANALYSIS_MODEL} imageIncluded=true analysisSucceeded=true`);

      return {
        result: {
          content: response.content,
          modelId: IMAGE_ANALYSIS_MODEL,
          provider: model.provider,
          fallbackUsed: false,
        },
        selection,
        fallbackUsed: false,
      };
    } catch (error) {
      lastError = error;
      console.error(`[Vision Router] requestId=${request.requestId ?? "none"} attempt failed model=${IMAGE_ANALYSIS_MODEL} imageIncluded=true retry=${attempt > 0} code=${error instanceof AIError ? error.code : "unknown"}`);
      if (!shouldRetry(error)) break;
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new AIError("AI_PROVIDER_FAILURE", "Image analysis failed for all available vision models.", 502);
}
