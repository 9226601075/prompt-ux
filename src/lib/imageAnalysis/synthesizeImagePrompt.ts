import type { ImageAnalysisResult } from "@/lib/imageAnalysis/types";

const INTERNAL_CONTENT = /not clearly visible|success criteria|audience instructions?|add audience|remove ambiguity|organize the response|add limitations?|adapt the prompt|combine all layer(?: improvements)?|\b(synthesis|finalized?|examples?|reasoning|constraints?|tone|structure|intent|context)\b/i;

function usable(value: string) {
  const normalized = value.trim();
  return normalized && !INTERNAL_CONTENT.test(normalized) ? normalized : "";
}

function usableList(values: string[]) {
  return values.map(usable).filter(Boolean);
}

function list(values: string[]) {
  return values.length > 1
    ? `${values.slice(0, -1).join(", ")}, and ${values.at(-1)}`
    : values[0] ?? "";
}

export function synthesizeImagePrompt(analysis: ImageAnalysisResult) {
  const subject = usable(analysis.subject);
  const appearance = usable(analysis.appearanceDetails);
  const visualStyle = usable(analysis.visualStyle);
  const mood = usable(analysis.mood);
  const details = usableList(analysis.importantDetails);
  const secondarySubjects = usableList(analysis.secondarySubjects);
  const objects = usableList(analysis.objects);
  const textInImage = usableList(analysis.textInImage);
  const colors = usableList(analysis.colorPalette);
  const environment = usable(analysis.environment);
  const composition = usable(analysis.composition);
  const camera = [analysis.camera.shotType, analysis.camera.framing, analysis.camera.angle]
    .map(usable)
    .filter(Boolean);
  const lighting = usable(analysis.lighting);
  const shadows = usable(analysis.shadows);
  const aesthetic = usable(analysis.overallAesthetic);

  if (!subject) return "";

  const sentences = [`Create a high-quality ${visualStyle ? `${visualStyle} ` : ""}image of ${subject}${appearance ? `, ${appearance}` : ""}.`];

  if (secondarySubjects.length > 0) sentences.push(`Include ${list(secondarySubjects)}.`);
  if (objects.length > 0) sentences.push(`The visible objects are ${list(objects)}.`);
  if (environment) sentences.push(`Set the image in ${environment}.`);
  if (composition) sentences.push(`Use ${composition}${camera.length > 0 ? `, photographed with ${list(camera)}` : ""}.`);
  else if (camera.length > 0) sentences.push(`Photograph it with ${list(camera)}.`);
  if (lighting) sentences.push(`Lighting is ${lighting}${shadows ? `, with ${shadows}` : ""}.`);
  else if (shadows) sentences.push(`The shadows are ${shadows}.`);
  if (colors.length > 0) sentences.push(`The color palette includes ${list(colors)}.`);
  if (mood || aesthetic) sentences.push(`The mood is ${[mood, aesthetic].filter(Boolean).join(" and ")}.`);
  if (details.length > 0) sentences.push(`Important visible details include ${list(details)}.`);
  if (textInImage.length > 0) sentences.push(`Visible text reads ${list(textInImage)}.`);

  return sentences.join(" ");
}