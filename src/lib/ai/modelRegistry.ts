import type { AIModel, ModelCapability, ModelSelection } from "./types";
import { AIError } from "./errors";
import { IMAGE_ANALYSIS_MODEL } from "../imageAnalysis/config";

const MODEL_REGISTRY: readonly AIModel[] = [
  {
    id: "openai/gpt-4.1-mini",
    apiModelId: "openai/gpt-4.1-mini",
    provider: "openrouter",
    displayName: "GPT-4.1 Mini",
    description: "Fast general-purpose prompt generation model.",
    capabilities: ["text", "prompt_optimization"],
    supportsText: true,
    supportsVision: false,
    supportsPromptGeneration: true,
    supportsImageAnalysis: false,
    priority: 10,
    enabled: true,
  },
  {
    id: "anthropic/claude-3.5-sonnet",
    apiModelId: "anthropic/claude-3.5-sonnet",
    provider: "openrouter",
    displayName: "Claude 3.5 Sonnet",
    description: "High-quality general-purpose prompt generation model.",
    capabilities: ["text", "prompt_optimization", "reasoning"],
    supportsText: true,
    supportsVision: false,
    supportsPromptGeneration: true,
    supportsImageAnalysis: false,
    priority: 20,
    enabled: true,
  },
  {
    id: IMAGE_ANALYSIS_MODEL,
    apiModelId: IMAGE_ANALYSIS_MODEL,
    provider: "openrouter",
    displayName: "NVIDIA Nemotron 3 Nano Omni",
    description: "The fixed vision model for image analysis.",
    capabilities: ["vision", "image_analysis"],
    supportsText: true,
    supportsVision: true,
    supportsPromptGeneration: false,
    supportsImageAnalysis: true,
    priority: 20,
    enabled: true,
  },
  {
    id: "google/gemini-2.5-flash",
    apiModelId: "google/gemini-2.5-flash",
    provider: "openrouter",
    displayName: "Gemini 2.5 Flash",
    description: "Fast general-purpose prompt generation model.",
    capabilities: ["text", "prompt_optimization"],
    supportsText: true,
    supportsVision: false,
    supportsPromptGeneration: true,
    supportsImageAnalysis: false,
    priority: 30,
    enabled: true,
  },
  {
    id: "nano-omni-3",
    apiModelId: "",
    provider: "openrouter",
    displayName: "Nano Omni 3",
    description: "Placeholder for a future Nano Omni 3 integration.",
    capabilities: ["text", "vision", "prompt_optimization", "image_analysis"],
    supportsText: true,
    supportsVision: true,
    supportsPromptGeneration: true,
    supportsImageAnalysis: true,
    priority: 40,
    enabled: false,
  },
  {
    id: "nvidia/nemotron",
    apiModelId: "",
    provider: "openrouter",
    displayName: "NVIDIA Nemotron",
    description: "Placeholder for a future NVIDIA Nemotron integration.",
    capabilities: ["text", "reasoning", "prompt_optimization"],
    supportsText: true,
    supportsVision: false,
    supportsPromptGeneration: true,
    supportsImageAnalysis: false,
    priority: 50,
    enabled: false,
  },
];

function supportsCapability(model: AIModel, capability: ModelCapability): boolean {
  if (!model.enabled) {
    return false;
  }

  if (capability === "vision") {
    return model.supportsVision || model.capabilities.includes("vision");
  }

  if (capability === "image_analysis") {
    return model.supportsImageAnalysis || model.capabilities.includes("image_analysis");
  }

  return model.capabilities.includes(capability);
}

export function getAllModels(): readonly AIModel[] {
  return MODEL_REGISTRY;
}

export function getEnabledModels(): AIModel[] {
  return MODEL_REGISTRY.filter((model) => model.enabled);
}

export function getModelsForCapability(capability: ModelCapability): AIModel[] {
  return MODEL_REGISTRY
    .filter((model) => supportsCapability(model, capability))
    .sort((left, right) => left.priority - right.priority);
}

export function getTextModels(): AIModel[] {
  return getModelsForCapability("text");
}

export function getVisionModels(): AIModel[] {
  return getModelsForCapability("vision");
}

export function getPromptGenerationModels(): AIModel[] {
  return getModelsForCapability("prompt_optimization");
}

export function getImageAnalysisModels(): AIModel[] {
  return getModelsForCapability("image_analysis");
}

export function getModelById(modelId: string): AIModel | undefined {
  return MODEL_REGISTRY.find((model) => model.id === modelId);
}

export function isValidModelForCapability(modelId: string, capability: ModelCapability): boolean {
  const model = getModelById(modelId);
  return model ? supportsCapability(model, capability) : false;
}

export function selectBestModel(capability: ModelCapability, requestedModelId?: string): ModelSelection {
  if (requestedModelId) {
    const requestedModel = getModelById(requestedModelId);
    if (!requestedModel) {
      throw new AIError("AI_INVALID_REQUEST", `Unknown model: ${requestedModelId}`, 400);
    }
    if (!supportsCapability(requestedModel, capability)) {
      throw new AIError("AI_INVALID_REQUEST", `Model ${requestedModelId} does not support ${capability}.`, 400);
    }
    return { requestedModelId, capability, model: requestedModel };
  }

  const model = getModelsForCapability(capability)[0];
  if (!model) {
    throw new AIError("AI_NO_CAPABLE_MODEL", `No enabled model supports ${capability}.`, 503);
  }
  return { capability, model };
}

export function getModelForCapability(capability: ModelCapability, requestedModelId?: string): AIModel {
  return selectBestModel(capability, requestedModelId).model;
}