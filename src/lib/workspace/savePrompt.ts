import type { WorkspacePromptRecord } from "./types";
import { LocalStorageWorkspaceRepository } from "./localStorageRepository";

const repository = new LocalStorageWorkspaceRepository();

export function saveGeneratedPrompt(input: {
  title: string;
  content: string;
  category: string;
  promptMode: string;
  score: number;
  source?: string;
  inputLanguage?: string;
  outputLanguage?: string;
  originalInput?: string;
}): WorkspacePromptRecord {
  return repository.savePrompt(input);
}
