import type { WorkspacePromptRecord, WorkspaceRepository, WorkspaceStats } from "./types";

const STORAGE_KEY = "prompt-ux-workspace";
const GUEST_MODE_KEY = "prompt-ux-guest-mode";

function readStoredPrompts(): WorkspacePromptRecord[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw) as WorkspacePromptRecord[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeStoredPrompts(prompts: WorkspacePromptRecord[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(prompts));
}

export class LocalStorageWorkspaceRepository implements WorkspaceRepository {
  getPrompts(): WorkspacePromptRecord[] {
    return readStoredPrompts();
  }

  savePrompt(input: {
    title: string;
    content: string;
    category: string;
    promptMode: string;
    score: number;
    source?: string;
  }): WorkspacePromptRecord {
    const timestamp = new Date().toISOString();
    const record: WorkspacePromptRecord = {
      id: `prompt-${Date.now()}`,
      title: input.title,
      content: input.content,
      category: input.category,
      promptMode: input.promptMode,
      createdAt: timestamp,
      updatedAt: timestamp,
      score: input.score,
      favorite: false,
      source: input.source ?? "engine",
    };

    const prompts = [...readStoredPrompts(), record];
    writeStoredPrompts(prompts);
    return record;
  }

  updatePrompt(id: string, updates: Partial<WorkspacePromptRecord>): WorkspacePromptRecord | null {
    const prompts = readStoredPrompts();
    const index = prompts.findIndex((prompt) => prompt.id === id);
    if (index === -1) {
      return null;
    }

    const updated = {
      ...prompts[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    prompts[index] = updated;
    writeStoredPrompts(prompts);
    return updated;
  }

  deletePrompt(id: string): void {
    const prompts = readStoredPrompts().filter((prompt) => prompt.id !== id);
    writeStoredPrompts(prompts);
  }

  toggleFavorite(id: string): WorkspacePromptRecord | null {
    const prompts = readStoredPrompts();
    const prompt = prompts.find((item) => item.id === id);
    if (!prompt) {
      return null;
    }

    const updated = this.updatePrompt(id, { favorite: !prompt.favorite });
    return updated ?? null;
  }

  searchPrompts(query: string): WorkspacePromptRecord[] {
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      return this.getPrompts();
    }

    return this.getPrompts().filter((prompt) => {
      return [prompt.title, prompt.content, prompt.category, prompt.promptMode]
        .join(" ")
        .toLowerCase()
        .includes(normalized);
    });
  }

  getStats(): WorkspaceStats {
    const prompts = this.getPrompts();
    const totalPrompts = prompts.length;
    const favorites = prompts.filter((prompt) => prompt.favorite).length;
    const recentActivities = Math.max(1, prompts.length);
    const averagePromptScore =
      totalPrompts > 0
        ? Math.round((prompts.reduce((sum, prompt) => sum + prompt.score, 0) / totalPrompts) * 10) / 10
        : 0;

    return {
      totalPrompts,
      favorites,
      recentActivities,
      averagePromptScore,
      recentPrompts: this.getRecentPrompts(5),
    };
  }

  getRecentPrompts(limit = 5): WorkspacePromptRecord[] {
    return [...this.getPrompts()]
      .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime())
      .slice(0, limit);
  }
}

export function getGuestMode(): boolean {
  if (typeof window === "undefined") {
    return true;
  }

  const stored = window.localStorage.getItem(GUEST_MODE_KEY);
  return stored === null ? true : stored === "true";
}

export function setGuestMode(enabled: boolean) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(GUEST_MODE_KEY, String(enabled));
}

export function clearWorkspaceStorage() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(STORAGE_KEY);
  window.localStorage.removeItem(GUEST_MODE_KEY);
}
