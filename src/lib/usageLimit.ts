export interface FreeUsageRecord {
  userId: string;
  remaining: number;
  lastResetAt: string;
}

export interface UsageRepository {
  getUsage(userId: string): FreeUsageRecord;
  saveUsage(record: FreeUsageRecord): void;
}

const FREE_PROMPTS_PER_DAY = 3;
const MS_PER_DAY = 24 * 60 * 60 * 1000;
const USAGE_KEY_PREFIX = "prompt-ux-free-usage";
const USER_ID_KEY = "prompt-ux-user-id";

function isClient(): boolean {
  return typeof window !== "undefined";
}

function getStorageKey(userId: string) {
  return `${USAGE_KEY_PREFIX}-${userId}`;
}

function generateUserId() {
  if (!isClient()) {
    return "guest";
  }

  if (typeof window.crypto?.randomUUID === "function") {
    return `guest-${window.crypto.randomUUID()}`;
  }

  return `guest-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function readStoredUsage(userId: string): FreeUsageRecord | null {
  if (!isClient()) {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(getStorageKey(userId));
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as FreeUsageRecord;
    if (
      typeof parsed === "object" &&
      parsed !== null &&
      typeof parsed.userId === "string" &&
      typeof parsed.remaining === "number" &&
      typeof parsed.lastResetAt === "string"
    ) {
      return parsed;
    }
  } catch {
    // Ignore malformed storage.
  }

  return null;
}

function writeStoredUsage(record: FreeUsageRecord) {
  if (!isClient()) {
    return;
  }

  window.localStorage.setItem(getStorageKey(record.userId), JSON.stringify(record));
}

function createDefaultUsage(userId: string): FreeUsageRecord {
  return {
    userId,
    remaining: FREE_PROMPTS_PER_DAY,
    lastResetAt: new Date().toISOString(),
  };
}

function getCurrentUserId(): string {
  if (!isClient()) {
    return "guest";
  }

  const existing = window.localStorage.getItem(USER_ID_KEY);
  if (existing) {
    return existing;
  }

  const newId = generateUserId();
  window.localStorage.setItem(USER_ID_KEY, newId);
  return newId;
}

function getResetUsage(userId: string): FreeUsageRecord {
  const existing = readStoredUsage(userId);
  if (!existing) {
    const fresh = createDefaultUsage(userId);
    writeStoredUsage(fresh);
    return fresh;
  }

  const lastReset = new Date(existing.lastResetAt).getTime();
  const elapsed = Date.now() - lastReset;

  if (Number.isNaN(lastReset) || elapsed >= MS_PER_DAY) {
    const resetRecord = createDefaultUsage(userId);
    writeStoredUsage(resetRecord);
    return resetRecord;
  }

  return existing;
}

export function getUsageForCurrentUser(): FreeUsageRecord {
  const userId = getCurrentUserId();
  return getResetUsage(userId);
}

export function consumeFreePrompts(count = 1): FreeUsageRecord {
  const userId = getCurrentUserId();
  const current = getResetUsage(userId);
  if (current.remaining <= 0) {
    return current;
  }

  const nextRecord: FreeUsageRecord = {
    ...current,
    remaining: Math.max(0, current.remaining - count),
  };

  writeStoredUsage(nextRecord);
  return nextRecord;
}

export function resetUsageForCurrentUser(): FreeUsageRecord {
  const userId = getCurrentUserId();
  const resetRecord = createDefaultUsage(userId);
  writeStoredUsage(resetRecord);
  return resetRecord;
}

export { FREE_PROMPTS_PER_DAY };
