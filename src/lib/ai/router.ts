import { getModelsForCapability, selectBestModel } from "./modelRegistry";
import { callOpenRouter } from "./providers/openrouter";
import { routeImageAnalysis } from "./visionRouter";
import type { AnalyzeImageRequest, GenerateTextRequest, ModelCapability, ModelSelection } from "./types";

function logDevelopment(message: string) {
  if (process.env.NODE_ENV === "development") console.info(`[AI Router] ${message}`);
}

function getSelections(capability: ModelCapability, requestedModelId?: string): ModelSelection[] {
  const selected = selectBestModel(capability, requestedModelId);
  const fallbackModels = getModelsForCapability(capability).filter((model) => model.id !== selected.model.id);
  return [selected, ...fallbackModels.map((model) => ({ capability, model }))];
}

async function callWithFallback<T>(
  capability: ModelCapability,
  requestedModelId: string | undefined,
  call: (selection: ModelSelection) => Promise<T>,
): Promise<{ result: T; selection: ModelSelection; fallbackUsed: boolean }> {
  const selections = getSelections(capability, requestedModelId);
  let lastError: unknown;

  for (const selection of selections) {
    logDevelopment(`Capability requested: ${capability}`);
    logDevelopment(`Selected model: ${selection.model.id}`);
    logDevelopment(`Provider: ${selection.model.provider}`);
    try {
      return {
        result: await call(selection),
        selection,
        fallbackUsed: selection.model.id !== selections[0].model.id,
      };
    } catch (error) {
      lastError = error;
      logDevelopment(`Model failed: ${selection.model.id}`);
    }
  }

  throw lastError instanceof Error ? lastError : new Error(`No model succeeded for ${capability}.`);
}

export async function generateText(request: GenerateTextRequest) {
  return callWithFallback(request.capability, request.modelId, async ({ model }) => ({
    content: await callOpenRouter(model.apiModelId, [
      { role: "system", content: request.systemInstruction },
      { role: "user", content: request.userInput },
    ], request.temperature),
    modelId: model.id,
    provider: model.provider,
  }));
}

export async function analyzeImage(request: AnalyzeImageRequest) {
  return routeImageAnalysis(request);
}