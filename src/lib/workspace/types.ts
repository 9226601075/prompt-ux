export type WorkspacePromptCategory = string;
export type WorkspacePromptMode = string;
export type WorkspaceLanguage = string;

export interface WorkspacePromptRecord {
  id: string;
  title: string;
  content: string;
  category: WorkspacePromptCategory;
  promptMode: WorkspacePromptMode;
  createdAt: string;
  updatedAt: string;
  score: number;
  favorite: boolean;
  source: string;
  inputLanguage?: WorkspaceLanguage;
  outputLanguage?: WorkspaceLanguage;
  originalInput?: string;
}

export interface WorkspaceStats {
  totalPrompts: number;
  favorites: number;
  recentActivities: number;
  averagePromptScore: number;
  recentPrompts: WorkspacePromptRecord[];
}

export interface WorkspaceRepository {
  getPrompts(): WorkspacePromptRecord[];
  savePrompt(input: {
    title: string;
    content: string;
    category: WorkspacePromptCategory;
    promptMode: WorkspacePromptMode;
    score: number;
    source?: string;
    inputLanguage?: WorkspaceLanguage;
    outputLanguage?: WorkspaceLanguage;
    originalInput?: string;
  }): WorkspacePromptRecord;
  updatePrompt(id: string, updates: Partial<WorkspacePromptRecord>): WorkspacePromptRecord | null;
  deletePrompt(id: string): void;
  toggleFavorite(id: string): WorkspacePromptRecord | null;
  searchPrompts(query: string): WorkspacePromptRecord[];
  getStats(): WorkspaceStats;
  getRecentPrompts(limit?: number): WorkspacePromptRecord[];
}
