export interface ValidationCriterion {
  name: string;
  score: number;
  summary: string;
}

export interface ValidationResult {
  overallScore: number;
  criteria: ValidationCriterion[];
  strengths: string[];
  weaknesses: string[];
  suggestedImprovements: string[];
}

export interface PromptValidator {
  validate(prompt: string): ValidationResult;
}
