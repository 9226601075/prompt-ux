"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

type AuthContextType = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;
    const browserSupabase = supabase;

    if (!browserSupabase) {
      setLoading(false);
      return () => {
        isMounted = false;
      };
    }

    const updateAuthState = (currentSession: Session | null) => {
      if (!isMounted) return;
      setSession(currentSession ?? null);
      setUser(currentSession?.user ?? null);
      setLoading(false);
    };

    const loadSession = async () => {
      const {
        data: { session: currentSession },
        error,
      } = await browserSupabase.auth.getSession();

      if (error) {
        updateAuthState(null);
        return;
      }

      updateAuthState(currentSession ?? null);
    };

    loadSession();

    const { data: listener } = browserSupabase.auth.onAuthStateChange((_event, updatedSession) => {
      updateAuthState(updatedSession ?? null);
    });

    return () => {
      isMounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    if (!supabase) {
      setUser(null);
      setSession(null);
      router.replace("/login");
      router.refresh();
      return;
    }

    const { error } = await supabase.auth.signOut();
    setUser(null);
    setSession(null);

    if (error) {
      console.error("Sign out error:", error.message);
    }

    router.replace("/login");
    router.refresh();
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
