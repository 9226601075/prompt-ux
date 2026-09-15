export type ImageAnalysisResult = {
  subject: string;
  secondarySubjects: string[];
  objects: string[];
  environment: string;
  composition: string;
  camera: {
    angle: string;
    framing: string;
    shotType: string;
  };
  lighting: string;
  shadows: string;
  colorPalette: string[];
  visualStyle: string;
  mood: string;
  appearanceDetails: string;
  textInImage: string[];
  importantDetails: string[];
  overallAesthetic: string;
};

export type RawImageAnalysis = Record<string, unknown>;

function asRecord(value: unknown): RawImageAnalysis {
  return value && typeof value === "object" && !Array.isArray(value) ? value as RawImageAnalysis : {};
}

function textOrDefault(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : "";
}

function stringArrayOrEmpty(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string").map((item) => item.trim()).filter(Boolean)
    : [];
}

export function normalizeImageAnalysis(value: unknown): ImageAnalysisResult {
  const source = asRecord(value);
  const subject = typeof source.subject === "string" ? source.subject.trim() : "";
  if (!subject) throw new Error("The vision model returned incomplete image analysis.");

  const camera = asRecord(source.camera);
  return {
    subject,
    secondarySubjects: stringArrayOrEmpty(source.secondarySubjects),
    objects: stringArrayOrEmpty(source.objects),
    environment: textOrDefault(source.environment),
    composition: textOrDefault(source.composition),
    camera: {
      angle: textOrDefault(camera.angle),
      framing: textOrDefault(camera.framing),
      shotType: textOrDefault(camera.shotType),
    },
    lighting: textOrDefault(source.lighting),
    shadows: textOrDefault(source.shadows),
    colorPalette: stringArrayOrEmpty(source.colorPalette),
    visualStyle: textOrDefault(source.visualStyle),
    mood: textOrDefault(source.mood),
    appearanceDetails: textOrDefault(source.appearanceDetails),
    textInImage: stringArrayOrEmpty(source.textInImage),
    importantDetails: stringArrayOrEmpty(source.importantDetails),
    overallAesthetic: textOrDefault(source.overallAesthetic),
  };
}

export function validateImageAnalysis(value: unknown): ImageAnalysisResult {
  return normalizeImageAnalysis(value);
}

export function validateImageAnalysisResponse(value: unknown): {
  analysis: ImageAnalysisResult;
  optimizedPrompt: string;
  modelUsed: string;
  provider: string;
  fallbackUsed: boolean;
} {
  const response = asRecord(value);
  const analysis = validateImageAnalysis(response.analysis);
  const optimizedPrompt = textOrDefault(response.optimizedPrompt);
  const modelUsed = textOrDefault(response.modelUsed);
  const provider = textOrDefault(response.provider);

  if (!optimizedPrompt || !modelUsed || !provider || typeof response.fallbackUsed !== "boolean") {
    throw new Error("The image analysis response is incomplete.");
  }

  return { analysis, optimizedPrompt, modelUsed, provider, fallbackUsed: response.fallbackUsed };
}