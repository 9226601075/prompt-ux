import { RuleBasedPromptValidator } from "./ruleBasedValidator";
import type { PromptValidator } from "./types";

export function createPromptValidator(): PromptValidator {
  return new RuleBasedPromptValidator();
}
