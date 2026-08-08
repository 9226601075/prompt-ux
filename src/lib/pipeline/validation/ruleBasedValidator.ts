import type { PromptValidator, ValidationResult } from "./types";

function scoreRange(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function containsAny(text: string, terms: string[]) {
  const lower = text.toLowerCase();
  return terms.some((term) => lower.includes(term));
}

export class RuleBasedPromptValidator implements PromptValidator {
  validate(prompt: string): ValidationResult {
    const lower = prompt.toLowerCase();

    const clarity = scoreRange(90 - (prompt.length > 220 ? 8 : 0) + (containsAny(lower, ["objective", "goal", "task"]) ? 6 : 0));
    const specificity = scoreRange(78 + (containsAny(lower, ["audience", "constraints", "output", "format", "steps"]) ? 9 : 0) + (prompt.length > 180 ? 7 : 0));
    const context = scoreRange(80 + (containsAny(lower, ["context", "background", "audience", "scenario"]) ? 10 : 0) + (containsAny(lower, ["constraints", "goal"]) ? 6 : 0));
    const expertRole = scoreRange(70 + (containsAny(lower, ["role", "expert", "senior", "specialist"]) ? 14 : 0) + (containsAny(lower, ["act as", "you are"]) ? 10 : 0));
    const constraints = scoreRange(76 + (containsAny(lower, ["constraint", "limitations", "avoid", "must", "only"]) ? 12 : 0) + (containsAny(lower, ["deadline", "format", "tone"]) ? 8 : 0));
    const completeness = scoreRange(82 + (containsAny(lower, ["success criteria", "deliverables", "output format", "example"]) ? 10 : 0) + (containsAny(lower, ["summary", "final recommendation"]) ? 6 : 0));
    const compatibility = scoreRange(84 + (containsAny(lower, ["universal", "compatibility", "clear", "structured"]) ? 8 : 0));

    const criteria = [
      { name: "Clarity", score: clarity, summary: clarity >= 80 ? "The prompt is easy to understand and well framed." : "The prompt could be made more direct and readable." },
      { name: "Specificity", score: specificity, summary: specificity >= 80 ? "The prompt includes concrete guidance and detail." : "The prompt could be more precise about expectations." },
      { name: "Context", score: context, summary: context >= 80 ? "The prompt provides enough situational context." : "The prompt needs more background or framing." },
      { name: "Expert Role", score: expertRole, summary: expertRole >= 80 ? "The instruction clearly adopts an expert perspective." : "The prompt would benefit from a stronger role definition." },
      { name: "Constraints", score: constraints, summary: constraints >= 80 ? "The prompt defines useful boundaries and limits." : "The prompt should state more explicit constraints." },
      { name: "Completeness", score: completeness, summary: completeness >= 80 ? "The prompt includes the core pieces needed to complete the job." : "The prompt is missing important deliverables or structure." },
      { name: "Universal AI Compatibility", score: compatibility, summary: compatibility >= 80 ? "The prompt is broadly compatible across modern AI systems." : "The prompt may need simpler phrasing or clearer structure for compatibility." },
    ];

    const strengths = criteria
      .filter((criterion) => criterion.score >= 80)
      .map((criterion) => criterion.name);

    const weaknesses = criteria
      .filter((criterion) => criterion.score < 80)
      .map((criterion) => criterion.name);

    const suggestedImprovements = weaknesses.map((criterion) => {
      if (criterion === "Clarity") return "Make the objective more explicit by stating the task and expected outcome in one sentence.";
      if (criterion === "Specificity") return "Add concrete instructions, expected output format, and notable details the model should follow.";
      if (criterion === "Context") return "Introduce target audience, use case, or background information so the prompt is better grounded.";
      if (criterion === "Expert Role") return "State the role or expertise level more clearly, such as 'act as a senior specialist'.";
      if (criterion === "Constraints") return "Define the boundaries, must-haves, and exclusions more explicitly.";
      if (criterion === "Completeness") return "Add success criteria, deliverables, and a final structure so the task feels fully specified.";
      return "Simplify or rephrase the instruction so it is more universally understandable by AI systems.";
    });

    const overallScore = Math.round(
      criteria.reduce((total, criterion) => total + criterion.score, 0) / criteria.length,
    );

    return {
      overallScore,
      criteria,
      strengths,
      weaknesses,
      suggestedImprovements,
    };
  }
}
