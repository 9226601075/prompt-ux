export type ModelCapability =
  | "text"
  | "reasoning"
  | "prompt_optimization"
  | "image_analysis"
  | "vision";

export type AIModel = {
  id: string;
  provider: string;
  displayName: string;
  description: string;
  capabilities: readonly ModelCapability[];
  supportsText: boolean;
  supportsVision: boolean;
  supportsPromptGeneration: boolean;
  supportsImageAnalysis: boolean;
  priority: number;
  enabled: boolean;
  apiModelId: string;
};

export type ModelSelection = {
  requestedModelId?: string;
  capability: ModelCapability;
  model: AIModel;
};

export type AIRequest = {
  capability: ModelCapability;
  modelId?: string;
};

export type GenerateTextRequest = AIRequest & {
  capability: "text" | "prompt_optimization";
  systemInstruction: string;
  userInput: string;
  temperature?: number;
};

export type AnalyzeImageRequest = AIRequest & {
  capability: "vision" | "image_analysis";
  imageDataUrl: string;
  systemInstruction: string;
  userInstruction: string;
  temperature?: number;
  validateContent?: (content: string) => void;
  requestId?: string;
};