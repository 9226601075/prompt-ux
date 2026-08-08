import type { AuthSession, AuthUser, AuthProviderType } from "./types";
import { isSupabaseConfigured, supabase } from "@/lib/supabaseClient";
import type { User } from "@supabase/supabase-js";

const STORAGE_KEY = "prompt-ux-auth-session-guest";
const STORAGE_VERSION = "v1";

function buildUser(provider: AuthProviderType, name: string, email: string | null): AuthUser {
  const createdAt = new Date().toISOString();

  return {
    id: `${provider}-${createdAt}`,
    name,
    email,
    avatarUrl: null,
    provider,
    createdAt,
  };
}

function getStorage(): Storage | null {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage;
}

export function getStoredGuestSessionSync(): AuthSession | null {
  const storage = getStorage();

  if (!storage) {
    return null;
  }

  const storedValue = storage.getItem(STORAGE_KEY);

  if (!storedValue) {
    return null;
  }

  try {
    const parsed = JSON.parse(storedValue) as AuthSession & { version?: string };

    if (parsed.version !== STORAGE_VERSION) {
      storage.removeItem(STORAGE_KEY);
      return null;
    }

    return parsed;
  } catch {
    storage.removeItem(STORAGE_KEY);
    return null;
  }
}

async function persistGuestSession(session: AuthSession): Promise<void> {
  const storage = getStorage();

  if (!storage) {
    return;
  }

  const payload = {
    version: STORAGE_VERSION,
    ...session,
  };

  storage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

export async function clearStoredGuestSession(): Promise<void> {
  const storage = getStorage();

  if (!storage) {
    return;
  }

  storage.removeItem(STORAGE_KEY);
}

function normalizeAuthProvider(user: User): AuthProviderType {
  const provider = user.identities?.[0]?.provider;

  if (provider === "google") {
    return "google";
  }

  return "email";
}

export function buildSessionFromSupabaseUser(user: User): AuthSession {
  const provider = normalizeAuthProvider(user);
  const name =
    user.user_metadata?.full_name || user.user_metadata?.name || user.email || "Authenticated User";

  return {
    provider,
    user: buildUser(provider, name, user.email),
  };
}

export async function signInAsGuest(): Promise<AuthSession> {
  const session: AuthSession = {
    provider: "guest",
    user: buildUser("guest", "Guest User", null),
  };

  await persistGuestSession(session);
  return session;
}

export async function signInWithEmail(email: string, password: string): Promise<AuthSession> {
  if (!isSupabaseConfigured) {
    throw new Error("Supabase is not configured. Please use guest mode or set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.");
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw error;
  }

  if (!data.session?.user) {
    throw new Error("Unable to complete sign in. Please try again.");
  }

  await clearStoredGuestSession();
  return buildSessionFromSupabaseUser(data.session.user);
}

export async function signUpWithEmail(
  name: string,
  email: string,
  password: string,
): Promise<AuthSession | null> {
  if (!isSupabaseConfigured) {
    throw new Error("Supabase is not configured. Please use guest mode or set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.");
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: name,
      },
    },
  });

  if (error) {
    throw error;
  }

  if (data.session?.user) {
    await clearStoredGuestSession();
    return buildSessionFromSupabaseUser(data.session.user);
  }

  return null;
}

export async function sendPasswordResetEmail(email: string): Promise<void> {
  if (!isSupabaseConfigured) {
    throw new Error("Supabase is not configured. Password reset is unavailable.");
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/login`,
  });

  if (error) {
    throw error;
  }
}

export async function signInWithGoogle(): Promise<void> {
  if (!isSupabaseConfigured) {
    throw new Error("Supabase is not configured. Google sign-in is unavailable.");
  }

  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/dashboard`,
    },
  });

  if (error) {
    throw error;
  }
}

export async function signOut(): Promise<void> {
  await supabase.auth.signOut();
  await clearStoredGuestSession();
}

export function getUserInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}
