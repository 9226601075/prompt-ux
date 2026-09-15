import { applyOutputLanguage } from "./languageSupport";
import type { EnglishOutputStyleId, LanguageId } from "./languageConfig";

export type PromptCategory =
  | "writing"
  | "coding"
  | "product"
  | "education"
  | "business"
  | "general";

export interface PromptAnalysis {
  intent: string;
  category: PromptCategory;
  role: string;
  template: string;
  addedContext: string[];
}

export type PromptGrade = "Excellent" | "Good" | "Needs Improvement";

export interface PromptScore {
  score: number;
  grade: PromptGrade;
  explanation: string[];
}

export interface MissingInformation {
  missingItems: string[];
  suggestions: string[];
  isComplete: boolean;
  message: string;
}

export interface OptimizedPromptResult {
  prompt: string;
  analysis: PromptAnalysis;
  score: PromptScore;
  missingInfo: MissingInformation;
}

export interface PromptVersion {
  id: string;
  versionNumber: number;
  prompt: string;
  analysis: PromptAnalysis;
  score: PromptScore;
  missingInfo: MissingInformation;
  improvements: string[];
}

export function buildRefinedPromptVersion({
  idea,
  mode = "professional",
  previousPrompt,
  versionNumber,
}: {
  idea: string;
  mode: PromptModeId;
  previousPrompt?: string;
  versionNumber: number;
}): PromptVersion {
  const baseResult = optimizePromptLocally(idea, mode);
  const normalizedIdea = normalizeIdea(idea);
  const previousContext = previousPrompt?.trim() ? previousPrompt.trim() : baseResult.prompt;

  const improvements = [
    "Expanded the context with clearer audience framing.",
    "Added stronger success criteria and explicit deliverables.",
    "Strengthened the structure with more detailed constraints and output guidance.",
  ].slice(0, Math.min(3, Math.max(1, versionNumber)));

  const refinementLines = [
    `Refinement ${versionNumber}:`,
    `Task: ${normalizedIdea}`,
    `Objective: Create a more explicit, detailed, and actionable version of the prompt.`,
    `Audience: Tailor the response for the intended user, stakeholder, or reader.`,
    `Context: Expand the brief with relevant background, assumptions, and constraints.`,
    `Deliverables: Clarify what the final response should include and how it should be structured.`,
    `Output Format: Use a clear hierarchy with a summary, key steps, supporting details, and a final recommendation.`,
    `Success Criteria: Ensure the response is practical, complete, and easy to execute.`,
    `Quality Bar: Make the prompt feel polished, specific, and ready for immediate use.`,
    versionNumber > 1
      ? `Improvement Focus: ${improvements.join(" ")}`
      : "Improvement Focus: Strengthen clarity, specificity, and usefulness.",
    `Previous Draft Reference: ${previousContext.slice(0, 240)}`,
  ];

  const prompt = [baseResult.prompt, "", ...refinementLines].join("\n");

  const analysis: PromptAnalysis = {
    ...baseResult.analysis,
    template: `${baseResult.analysis.template} • Refined v${versionNumber}`,
    addedContext: [...baseResult.analysis.addedContext, ...improvements],
  };

  const baseScore = baseResult.score;
  const scoreBoost = Math.min(10, versionNumber * 2 + (prompt.length > 700 ? 3 : 0));
  const scoreValue = Math.min(99, baseScore.score + scoreBoost);
  const score: PromptScore = {
    score: scoreValue,
    grade:
      scoreValue >= 90 ? "Excellent" : scoreValue >= 70 ? "Good" : "Needs Improvement",
    explanation: [
      ...baseScore.explanation,
      `Refinement ${versionNumber}: Added richer context, clearer structure, and stronger expectations.`,
    ],
  };

  const missingInfo: MissingInformation = {
    ...baseResult.missingInfo,
    message:
      versionNumber > 1
        ? "The refined version introduces more detail and clearer expectations."
        : baseResult.missingInfo.message,
    suggestions: [
      ...baseResult.missingInfo.suggestions,
      "Add examples, metrics, or deadlines to push the prompt even further.",
    ],
  };

  return {
    id: `version-${versionNumber}`,
    versionNumber,
    prompt,
    analysis,
    score,
    missingInfo,
    improvements,
  };
}

export type PromptModeId = "quick" | "professional" | "expert" | "business" | "ultimate";

export type PromptModeOption = {
  id: PromptModeId;
  label: string;
  description: string;
};

export const PROMPT_MODE_OPTIONS: PromptModeOption[] = [
  { id: "quick", label: "Quick", description: "Short and simple" },
  { id: "professional", label: "Professional", description: "Detailed with context and output format" },
  { id: "expert", label: "Expert", description: "Role, context, constraints, reasoning, structure, and success criteria" },
  { id: "business", label: "Business", description: "Business-focused with marketing and conversion optimization" },
  { id: "ultimate", label: "Ultimate", description: "Maximally comprehensive prompt engineering" },
];

type PromptTemplateProfile = {
  name: string;
  description: string;
  role: (idea: string) => string;
  objective: (idea: string) => string;
  context: (idea: string) => string[];
  requirements: (idea: string) => string[];
  constraints: (idea: string) => string[];
  outputFormat: (idea: string) => string;
  successCriteria: (idea: string) => string;
};

function normalizeIdea(idea: string) {
  return idea.trim().replace(/\s+/g, " ");
}

function inferIntent(idea: string) {
  const lower = idea.toLowerCase();

  if (/(create|write|draft|compose|generate|build)/.test(lower)) {
    return "create";
  }

  if (/(explain|teach|clarify|summarize|describe)/.test(lower)) {
    return "explain";
  }

  if (/(plan|strategy|roadmap|launch|schedule)/.test(lower)) {
    return "plan";
  }

  if (/(analyze|review|compare|evaluate|optimize|improve)/.test(lower)) {
    return "analyze";
  }

  if (/(rewrite|edit|revise|reframe)/.test(lower)) {
    return "rewrite";
  }

  if (/(debug|fix|error|bug|issue|problem)/.test(lower)) {
    return "debug";
  }

  return "general";
}

function detectCategory(idea: string): PromptCategory {
  const lower = idea.toLowerCase();

  if (/(code|function|api|debug|typescript|python|javascript|database|server|class|module)/.test(lower)) {
    return "coding";
  }

  if (/(design|ux|ui|product|feature|user|persona|prototype|journey)/.test(lower)) {
    return "product";
  }

  if (/(teach|lesson|explain|study|learn|tutorial|education)/.test(lower)) {
    return "education";
  }

  if (/(business|market|revenue|launch|sales|strategy|plan|team)/.test(lower)) {
    return "business";
  }

  if (/(email|write|blog|article|story|content|copy|campaign)/.test(lower)) {
    return "writing";
  }

  return "general";
}

function inferMissingContext(idea: string) {
  const lower = idea.toLowerCase();
  const missing: string[] = [];

  if (!/(for|audience|reader|user|target)/.test(lower)) {
    missing.push("Add a target audience if one is not explicit.");
  }

  if (!/(goal|objective|purpose|need|want|outcome)/.test(lower)) {
    missing.push("Clarify the primary goal or desired outcome.");
  }

  if (!/(tone|style|formal|casual|concise|detailed|length)/.test(lower)) {
    missing.push("Specify any tone, length, or style preference.");
  }

  return missing;
}

function detectMissingInformation(idea: string): MissingInformation {
  const lower = idea.toLowerCase();
  const missingItems: string[] = [];
  const suggestions: string[] = [];

  const hasAudience = /(for|audience|reader|user|target)/.test(lower);
  const hasGoal = /(goal|objective|purpose|need|want|outcome)/.test(lower);
  const hasTone = /(tone|style|formal|casual|concise|detailed|length)/.test(lower);
  const hasFormat = /(format|structure|list|email|article|code|steps|presentation|summary)/.test(lower);
  const hasConstraints = /(limit|constraint|required|avoid|only|exactly|maximum|min|max|word|characters|budget|deadline)/.test(lower);

  if (!hasAudience) {
    missingItems.push("Target audience is missing.");
    suggestions.push("Add who the prompt is for, such as customers, developers, or learners.");
  }

  if (!hasGoal) {
    missingItems.push("Primary goal or outcome is unclear.");
    suggestions.push("State the desired result or why the prompt is needed.");
  }

  if (!hasTone) {
    missingItems.push("Tone, style, or output length is not specified.");
    suggestions.push("Specify whether the response should be formal, concise, friendly, detailed, etc.");
  }

  if (!hasFormat) {
    missingItems.push("Expected output format is not defined.");
    suggestions.push("Explain the desired structure, such as email, list, code sample, or summary.");
  }

  if (!hasConstraints) {
    missingItems.push("Constraints or limits are not provided.");
    suggestions.push("Include practical constraints like word count, audience level, or technical scope.");
  }

  const isComplete = missingItems.length === 0;
  const message = isComplete
    ? "Your prompt is already well-defined."
    : "The request is missing the following important information.";

  return { missingItems, suggestions, isComplete, message };
}

function createProfile(category: PromptCategory): PromptTemplateProfile {
  switch (category) {
    case "coding":
      return {
        name: "engineering",
        description: "Technical solution design",
        role: () => "a senior software engineer",
        objective: () => "create or improve a reliable technical solution that meets the stated need.",
        context: (idea) => [
          `The request concerns a technical task: ${idea}`,
          "Include any relevant stack, constraints, or implementation assumptions.",
        ],
        requirements: () => [
          "Produce a solution that is practical and maintainable.",
          "Explain key decisions briefly and clearly.",
        ],
        constraints: () => [
          "Keep the response implementation-focused and actionable.",
          "Avoid unnecessary filler or speculative details.",
        ],
        outputFormat: () => "Use clear sections such as approach, implementation notes, and example usage.",
        successCriteria: () => "The output should be understandable, correct, and ready for a developer to use.",
      };

    case "product":
      return {
        name: "product",
        description: "Product and experience design",
        role: () => "a product strategy specialist",
        objective: () => "develop a user-focused product recommendation or solution.",
        context: (idea) => [
          `The request is centered on a product or experience problem: ${idea}`,
          "Frame the answer around user needs, business value, and usability.",
        ],
        requirements: () => [
          "Highlight the core user problem and proposed value.",
          "Make the recommendation practical and easy to evaluate.",
        ],
        constraints: () => [
          "Keep the response concise but grounded in user experience.",
          "Do not rely on vague or unsupported claims.",
        ],
        outputFormat: () => "Use a short summary, key opportunities, and a recommended next step.",
        successCriteria: () => "The output should feel clear, relevant, and decision-ready.",
      };

    case "education":
      return {
        name: "education",
        description: "Instructional and educational explanation",
        role: () => "an instructional design expert",
        objective: () => "explain the topic in a way that improves understanding for the intended audience.",
        context: (idea) => [
          `The request is educational: ${idea}`,
          "Adapt the explanation to the learner's level and likely questions.",
        ],
        requirements: () => [
          "Break the topic into clear, understandable parts.",
          "Include examples or analogies where helpful.",
        ],
        constraints: () => [
          "Avoid jargon unless it is explained simply.",
          "Keep the pacing clear and supportive.",
        ],
        outputFormat: () => "Use a simple structure with key points, examples, and a summary.",
        successCriteria: () => "The output should be easy to follow and improve comprehension.",
      };

    case "business":
      return {
        name: "business",
        description: "Strategy and business planning",
        role: () => "a business strategy advisor",
        objective: () => "produce a practical and strategic plan that supports the stated business goal.",
        context: (idea) => [
          `The request is business-oriented: ${idea}`,
          "Connect the answer to outcomes, priorities, and likely tradeoffs.",
        ],
        requirements: () => [
          "Show the main objective, key actions, and priorities.",
          "Make the plan realistic and measurable where possible.",
        ],
        constraints: () => [
          "Avoid overly abstract recommendations.",
          "Keep the plan practical and execution-oriented.",
        ],
        outputFormat: () => "Use a short overview, action plan, and expected outcomes.",
        successCriteria: () => "The output should be actionable and aligned to business value.",
      };

    case "writing":
      return {
        name: "writing",
        description: "Content and communications writing",
        role: () => "a senior copywriter",
        objective: () => "create a polished piece of writing that matches the audience and purpose.",
        context: (idea) => [
          `The request is about writing or communication: ${idea}`,
          "Tailor the tone, structure, and style to the intended audience.",
        ],
        requirements: () => [
          "Make the writing clear, persuasive, and easy to read.",
          "Preserve the key message while improving flow and clarity.",
        ],
        constraints: () => [
          "Stay concise unless the request asks for depth.",
          "Avoid repetitive or generic wording.",
        ],
        outputFormat: () => "Use a strong opening, supporting points, and a clear closing.",
        successCriteria: () => "The writing should feel polished, relevant, and ready to use.",
      };

    default:
      return {
        name: "general",
        description: "General-purpose assistance",
        role: () => "a highly capable assistant",
        objective: () => "deliver a useful and well-structured response to the request.",
        context: (idea) => [`The request is general: ${idea}`],
        requirements: () => [
          "Be clear, helpful, and directly relevant.",
          "Organize the answer in a logical way.",
        ],
        constraints: () => [
          "Avoid unnecessary complexity.",
          "Keep the answer practical and easy to understand.",
        ],
        outputFormat: () => "Use a concise structure with clear sections and a conclusion.",
        successCriteria: () => "The answer should satisfy the request and feel complete.",
      };
  }
}

function getModeDefinition(mode: PromptModeId): PromptModeOption {
  return PROMPT_MODE_OPTIONS.find((option) => option.id === mode) ?? PROMPT_MODE_OPTIONS[1];
}

function buildPromptForMode(
  mode: PromptModeId,
  normalizedIdea: string,
  profile: PromptTemplateProfile,
  contextLines: string[],
  requirements: string[],
  constraints: string[],
  outputFormat: string,
  successCriteria: string,
  analysis: PromptAnalysis,
): string {
  const objective = profile.objective(normalizedIdea);
  const modeDefinition = getModeDefinition(mode);

  switch (mode) {
    case "quick":
      return [
        `Mode: ${modeDefinition.label}`,
        `Task: ${normalizedIdea}`,
        `Goal: ${objective}`,
        `Output: ${outputFormat}`,
      ].join("\n");

    case "professional":
      return [
        `Mode: ${modeDefinition.label}`,
        `Role: ${analysis.role}`,
        `Objective: ${objective}`,
        `Context: ${contextLines.join(" ")}`,
        `Requirements: ${requirements.join(" ")}`,
        `Output Format: ${outputFormat}`,
        `Success Criteria: ${successCriteria}`,
      ].join("\n");

    case "expert":
      return [
        `Mode: ${modeDefinition.label}`,
        `Role: ${analysis.role}`,
        `Objective: ${objective}`,
        `Context: ${contextLines.join(" ")}`,
        `Constraints: ${constraints.join(" ")}`,
        `Reasoning: Think step by step, prioritize accuracy, and make tradeoffs explicit before presenting the final answer.`,
        `Output Structure: ${outputFormat}`,
        `Success Criteria: ${successCriteria}`,
      ].join("\n");

    case "business":
      return [
        `Mode: ${modeDefinition.label}`,
        `Role: ${analysis.role}`,
        `Business Objective: ${objective}`,
        `Audience: Identify the target customer, stakeholder, or decision-maker for this request.`,
        `Context: ${contextLines.join(" ")}`,
        `Marketing Angle: Emphasize value proposition, differentiation, urgency, and clear calls to action.`,
        `Conversion Focus: Optimize the response for clarity, persuasion, and measurable business impact.`,
        `Output Format: ${outputFormat}`,
        `Success Criteria: ${successCriteria}`,
      ].join("\n");

    case "ultimate":
      return [
        `Mode: ${modeDefinition.label}`,
        `Role: ${analysis.role}`,
        `Objective: ${objective}`,
        `Context: ${contextLines.join(" ")}`,
        `Requirements: ${requirements.join(" ")}`,
        `Constraints: ${constraints.join(" ")}`,
        `Reasoning: Break the problem into assumptions, options, tradeoffs, and a recommended path before finalizing the response.`,
        `Execution Plan: Provide a structured approach, key insights, implementation steps, and a final recommendation.`,
        `Output Structure: ${outputFormat}`,
        `Quality Bar: Deliver a highly precise, comprehensive, and actionable answer with no vague filler.`,
        `Success Criteria: ${successCriteria}`,
      ].join("\n");
  }
}

export function optimizePromptLocally(
  idea: string,
  mode: PromptModeId = "professional",
  outputLanguage: LanguageId = "english",
  outputStyle?: EnglishOutputStyleId,
): OptimizedPromptResult {
  const normalizedIdea = normalizeIdea(idea);
  const intent = inferIntent(normalizedIdea);
  const category = detectCategory(normalizedIdea);
  const profile = createProfile(category);
  const addedContext = inferMissingContext(normalizedIdea);

  const analysis: PromptAnalysis = {
    intent,
    category,
    role: profile.role(normalizedIdea),
    template: getModeDefinition(mode).label,
    addedContext,
  };

  const contextLines = [
    ...profile.context(normalizedIdea),
    ...(addedContext.length > 0 ? [`Added context: ${addedContext.join(" ")}`] : []),
  ];

  const requirements = profile.requirements(normalizedIdea);
  const constraints = profile.constraints(normalizedIdea);
  const outputFormat = profile.outputFormat(normalizedIdea);
  const successCriteria = profile.successCriteria(normalizedIdea);

  const prompt = buildPromptForMode(
    mode,
    normalizedIdea,
    profile,
    contextLines,
    requirements,
    constraints,
    outputFormat,
    successCriteria,
    analysis,
  );

  const missingInfo = detectMissingInformation(normalizedIdea);

  const score = scorePrompt({
    prompt,
    context: contextLines.join(" "),
    constraints: constraints.join(" "),
    outputFormat,
    mode,
  });

  const localizedPrompt = applyOutputLanguage(prompt, outputLanguage);
  const styledPrompt = outputLanguage === "english" && outputStyle
    ? `${localizedPrompt}\nStyle: Use ${outputStyle} English.`
    : localizedPrompt;

  return { prompt: styledPrompt, analysis, score, missingInfo };
}

function scorePrompt(input: {
  prompt: string;
  context: string;
  constraints: string;
  outputFormat: string;
  mode: PromptModeId;
}): PromptScore {
  const clarity = rateClarity(input.prompt);
  const contextScore = rateContext(input.context);
  const specificity = rateSpecificity(input.prompt);
  const formatScore = rateFormat(input.outputFormat);
  const constraintsScore = rateConstraints(input.constraints);

  const modeWeight =
    input.mode === "quick"
      ? 0
      : input.mode === "professional"
      ? 12
      : input.mode === "expert"
      ? 22
      : input.mode === "business"
      ? 20
      : 32;

  const rawScore = clarity + contextScore + specificity + formatScore + constraintsScore + modeWeight;
  const score = Math.min(99, Math.round((rawScore / 520) * 100));

  const explanation: string[] = [];

  explanation.push(
    `Clarity ${clarity}/100: ${clarity >= 80 ? "The prompt is clear and easy to understand." : "The prompt could be more concise or better organized."}`,
  );
  explanation.push(
    `Context ${contextScore}/100: ${contextScore >= 80 ? "The context is present and relevant." : "The prompt should include stronger contextual details."}`,
  );
  explanation.push(
    `Specificity ${specificity}/100: ${specificity >= 80 ? "The prompt is specific and actionable." : "The prompt would benefit from more concrete detail."}`,
  );
  explanation.push(
    `Output Format ${formatScore}/100: ${formatScore >= 80 ? "A useful output structure is defined." : "The output format is weak or too vague."}`,
  );
  explanation.push(
    `Constraints ${constraintsScore}/100: ${constraintsScore >= 80 ? "Requirements and limitations are clearly stated." : "Constraints need to be more explicit or appropriate."}`,
  );

  const grade: PromptGrade =
    score >= 90 ? "Excellent" : score >= 70 ? "Good" : "Needs Improvement";

  return { score, grade, explanation };
}

function rateClarity(prompt: string) {
  const length = prompt.length;
  const sentences = prompt.split(/[.!?]\s+/).filter(Boolean).length;
  const density = Math.min(100, Math.max(20, Math.round((sentences / Math.max(1, length / 120)) * 100)));
  return density;
}

function rateContext(context: string) {
  const score = 40 + Math.min(60, Math.round((context.split(" ").length / 20) * 20));
  return Math.min(100, score);
}

function rateSpecificity(prompt: string) {
  const specificTerms = [
    "audience",
    "goal",
    "metric",
    "output",
    "format",
    "constraints",
    "steps",
    "tone",
    "style",
  ];
  const lower = prompt.toLowerCase();
  const found = specificTerms.filter((term) => lower.includes(term)).length;
  return Math.min(100, 30 + found * 10);
}

function rateFormat(outputFormat: string) {
  return outputFormat.length > 10 ? 90 : 50;
}

function rateConstraints(constraints: string) {
  return constraints.length > 10 ? 90 : 50;
}
