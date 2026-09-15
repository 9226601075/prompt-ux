import { NextRequest, NextResponse } from "next/server";
import { AIError } from "@/lib/ai/errors";
import { routeImageAnalysis } from "@/lib/ai/visionRouter";
import { synthesizeImagePrompt } from "@/lib/imageAnalysis/synthesizeImagePrompt";
import { ACCEPTED_IMAGE_TYPES, MAX_IMAGE_BYTES } from "@/lib/imageAnalysis/config";
import { normalizeImageAnalysis, validateImageAnalysisResponse, type ImageAnalysisResult } from "@/lib/imageAnalysis/types";

const ACCEPTED_IMAGE_TYPE_SET = new Set<string>(ACCEPTED_IMAGE_TYPES);

export type NormalizedImageAnalysisResponse = {
  analysis: ImageAnalysisResult;
  optimizedPrompt: string;
  modelUsed: string;
  provider: string;
  fallbackUsed: boolean;
  requestId?: string;
  message?: string;
  diagnostics?: {
    modelSelected: string;
    realAnalysisSucceeded: boolean;
    fallbackUsed: boolean;
    demoModeUsed: boolean;
  };
};

function asString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function asStringArray(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string").map((item) => item.trim()).filter(Boolean);
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function firstString(source: Record<string, unknown>, ...keys: string[]) {
  for (const key of keys) {
    const value = asString(source[key]);
    if (value) return value;
  }
  return "";
}

function extractResponseText(content: string) {
  return content
    .replace(/<think>[\s\S]*?<\/think>/gi, "")
    .replace(/^\s*(?:final answer|final|answer)\s*:\s*/i, "")
    .trim();
}

function parseAnalysis(content: string): ImageAnalysisResult {
  const responseText = extractResponseText(content);
  if (!responseText) throw new AIError("AI_PROVIDER_FAILURE", "The vision model returned no usable image analysis.", 502);

  const withoutFence = responseText.replace(/^\s*```(?:json)?\s*/i, "").replace(/\s*```\s*$/i, "").trim();
  const start = withoutFence.indexOf("{");
  const end = withoutFence.lastIndexOf("}");
  let parsed: Record<string, unknown> = {};

  if (start !== -1 && end > start) {
    try {
      parsed = asRecord(JSON.parse(withoutFence.slice(start, end + 1)));
    } catch {
      if (/^\s*[{[]/.test(withoutFence)) {
        throw new AIError("AI_PROVIDER_FAILURE", "The vision model returned invalid image analysis.", 502);
      }
    }
  }

  const camera = asRecord(parsed.camera);
  const subject = firstString(parsed, "subject") || (Object.keys(parsed).length === 0 ? withoutFence : "");

  const analysis = {
    subject,
    secondarySubjects: asStringArray(parsed.secondarySubjects),
    objects: asStringArray(parsed.objects),
    environment: firstString(parsed, "environment"),
    composition: firstString(parsed, "composition"),
    camera: {
      angle: firstString(camera, "angle", "perspective"),
      framing: firstString(camera, "framing"),
      shotType: firstString(camera, "shotType"),
    },
    lighting: asString(parsed.lighting),
    shadows: asString(parsed.shadows),
    colorPalette: asStringArray(parsed.colorPalette),
    visualStyle: asString(parsed.visualStyle),
    mood: asString(parsed.mood),
    appearanceDetails: firstString(parsed, "appearanceDetails", "appearance", "details"),
    textInImage: asStringArray(parsed.textInImage),
    importantDetails: asStringArray(parsed.importantDetails),
    overallAesthetic: firstString(parsed, "overallAesthetic", "aesthetic"),
  };

  console.info(`[Vision Parser] contentType=string contentLength=${content.length} parsedKeys=${Object.keys(parsed).join(",") || "none"}`);

  if (!analysis.subject) throw new AIError("AI_PROVIDER_FAILURE", "The vision model returned no usable image subject.", 502);

  return analysis;
}

const SYSTEM_INSTRUCTION = [
  "You are a visual analysis engine for an image-generation prompt tool.",
  "Analyze only what is visible in the supplied image. Use visual descriptions only and never identify or guess the real person in the image. Do not generate a final image prompt.",
  "Return only valid JSON with exactly these fields: subject, secondarySubjects, objects, environment, composition, camera, lighting, shadows, colorPalette, visualStyle, mood, appearanceDetails, textInImage, importantDetails, overallAesthetic.",
  "camera must contain angle, framing, and shotType. Arrays must contain strings. Use an empty string or empty array when a detail is not visible or relevant.",
].join(" ");

const USER_INSTRUCTION = "Analyze this image specifically for creating a highly accurate image-generation prompt for recreating a visually similar image.\n\nAnalyze the main subject and any secondary subjects, visible appearance, clothing, pose, facial expression without identifying the person, objects, environment, background, composition, camera angle, framing, shot type, lighting, shadows, colors, textures and materials, depth of field, photographic or artistic visual style, mood, image quality, approximate aspect ratio, and other important visible details.\n\nUse visual descriptions only. Do not identify or guess the real person in the image.\n\nReturn a detailed description that can be converted into an image-generation prompt. Return it using the requested JSON structure.";

export async function POST(request: NextRequest) {
  const requestId = crypto.randomUUID();
  console.info(`[ImagePrompt] requestId=${requestId} stage=analysis`);

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "A multipart image upload is required." }, { status: 400 });
  }

  const image = formData.get("image");
  if (!(image instanceof File)) {
    return NextResponse.json({ error: "Please provide an image file." }, { status: 400 });
  }

  if (!ACCEPTED_IMAGE_TYPE_SET.has(image.type)) {
    return NextResponse.json({ error: "Unsupported file type. Please upload a JPG, PNG, or WEBP image." }, { status: 400 });
  }

  if (image.size === 0 || image.size > MAX_IMAGE_BYTES) {
    return NextResponse.json({ error: "Image files must be larger than 0 bytes and no larger than 10 MB." }, { status: 400 });
  }

  try {
    const imageBase64 = Buffer.from(await image.arrayBuffer()).toString("base64");
    const imageDataUrl = `data:${image.type};base64,${imageBase64}`;
    if (!imageBase64 || image.size > MAX_IMAGE_BYTES || !new RegExp(`^data:image\\/(?:${ACCEPTED_IMAGE_TYPES.map((type) => type.slice(6)).join("|")});base64,[A-Za-z0-9+/]+=*$`).test(imageDataUrl)) {
      return NextResponse.json({ error: "The image payload is invalid or empty.", requestId }, { status: 400 });
    }

    const response = await routeImageAnalysis({
      capability: "image_analysis",
      imageDataUrl,
      systemInstruction: SYSTEM_INSTRUCTION,
      userInstruction: USER_INSTRUCTION,
      temperature: 0.2,
      validateContent: parseAnalysis,
      requestId,
    });
    const analysis = normalizeImageAnalysis(parseAnalysis(response.result.content));

    if (!analysis.subject) {
      throw new AIError("AI_PROVIDER_FAILURE", "The vision model returned no usable image subject.", 502);
    }

    console.info(`[ImagePrompt] requestId=${requestId} stage=analysis status=success model=${response.result.modelId}`);

    const responseBody = {
      analysis,
      optimizedPrompt: synthesizeImagePrompt(analysis),
      modelUsed: response.result.modelId,
      provider: response.result.provider,
      fallbackUsed: response.fallbackUsed,
      ...(process.env.NODE_ENV === "development" ? {
        diagnostics: {
          modelSelected: response.result.modelId,
          realAnalysisSucceeded: true,
          fallbackUsed: response.fallbackUsed,
          demoModeUsed: false,
        },
      } : {}),
      requestId,
    } satisfies NormalizedImageAnalysisResponse;

    const validatedResponse = validateImageAnalysisResponse(responseBody);
    return NextResponse.json({ ...responseBody, ...validatedResponse });
  } catch (error) {
    console.error(`[ImagePrompt] requestId=${requestId} stage=analysis status=failed code=${error instanceof AIError ? error.code : "unknown"}`);

    if (error instanceof AIError) {
      const safeMessage = error.code === "AI_CONFIGURATION"
        ? "Real image analysis is not configured. Please configure a valid OpenRouter vision model and API key."
        : error.code === "AI_NO_CAPABLE_MODEL"
        ? "No vision-capable AI model is currently available."
        : error.code === "AI_INVALID_REQUEST"
          ? "The selected image could not be processed."
          : "Image analysis is temporarily unavailable. Please try again.";

      return NextResponse.json({ error: safeMessage, code: error.code, requestId }, { status: error.status });
    }

    return NextResponse.json({ error: "Image analysis is temporarily unavailable. Please try again.", code: "AI_INVALID_RESPONSE", requestId }, { status: 502 });
  }
}
