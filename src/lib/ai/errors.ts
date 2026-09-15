export type AIErrorCode =
  | "AI_CONFIGURATION"
  | "AI_INVALID_REQUEST"
  | "AI_NO_CAPABLE_MODEL"
  | "AI_MODEL_UNAVAILABLE"
  | "AI_PROVIDER_FAILURE"
  | "AI_TIMEOUT";

export class AIError extends Error {
  constructor(
    public readonly code: AIErrorCode,
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "AIError";
  }
}