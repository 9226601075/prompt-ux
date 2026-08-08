"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { supabase } from "@/lib/supabaseClient";
import type { Session } from "@supabase/supabase-js";
import {
  clearStoredGuestSession,
  getStoredGuestSessionSync,
  signInAsGuest as signInAsGuestService,
  signInWithEmail as signInWithEmailService,
  signInWithGoogle as signInWithGoogleService,
  signUpWithEmail as signUpWithEmailService,
  sendPasswordResetEmail as sendPasswordResetEmailService,
  signOut as signOutService,
  buildSessionFromSupabaseUser,
} from "./authService";
import type { AuthSession } from "./types";

interface AuthContextValue {
  session: AuthSession | null;
  isAuthenticated: boolean;
  isGuest: boolean;
  isGoogleUser: boolean;
  isHydrated: boolean;
  signInAsGuest: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signUpWithEmail: (name: string, email: string, password: string) => Promise<void>;
  sendPasswordResetEmail: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    let isMounted = true;

    void (async () => {
      const storedGuestSession = getStoredGuestSessionSync();
      const { data } = await supabase.auth.getSession();

      if (!isMounted) {
        return;
      }

      if (data.session?.user) {
        setSession(buildSessionFromSupabaseUser(data.session.user));
      } else if (storedGuestSession) {
        setSession(storedGuestSession);
      }

      setIsHydrated(true);
    })();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_: string, session: Session | null) => {
      if (!isMounted) {
        return;
      }

      if (session?.user) {
        void clearStoredGuestSession();
        setSession(buildSessionFromSupabaseUser(session.user));
      } else {
        setSession(getStoredGuestSessionSync());
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signInAsGuest = useCallback(async () => {
    const nextSession = await signInAsGuestService();
    setSession(nextSession);
  }, []);

  const signInWithEmail = useCallback(async (email: string, password: string) => {
    const nextSession = await signInWithEmailService(email, password);
    setSession(nextSession);
  }, []);

  const signInWithGoogle = useCallback(async () => {
    await signInWithGoogleService();
  }, []);

  const signUpWithEmail = useCallback(async (name: string, email: string, password: string) => {
    const nextSession = await signUpWithEmailService(name, email, password);

    if (nextSession) {
      setSession(nextSession);
    }
  }, []);

  const sendPasswordResetEmail = useCallback(async (email: string) => {
    await sendPasswordResetEmailService(email);
  }, []);

  const signOut = useCallback(async () => {
    await signOutService();
    setSession(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      isAuthenticated: Boolean(session),
      isGuest: session?.provider === "guest",
      isGoogleUser: session?.provider === "google",
      isHydrated,
      signInAsGuest,
      signInWithEmail,
      signInWithGoogle,
      signUpWithEmail,
      sendPasswordResetEmail,
      signOut,
    }),
    [isHydrated, session, signInAsGuest, signInWithEmail, signInWithGoogle, signUpWithEmail, sendPasswordResetEmail, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
