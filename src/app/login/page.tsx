"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/lib/supabaseClient";
import { setGuestMode, setGuestSession } from "@/lib/workspace/localStorageRepository";

export default function LoginRoute() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && user) router.replace("/");
  }, [authLoading, router, user]);

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    if (!email.trim() || !password) {
      setError("Enter your email and password.");
      return;
    }
    setLoading(true);
    setGuestMode(false);
    setGuestSession(false);

    if (!supabase) {
      setError("Supabase is not configured for this environment.");
      setLoading(false);
      return;
    }

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (signInError) throw signInError;
      router.replace("/");
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unable to log in. Please check your details and try again.");
      setLoading(false);
    }
  };

  const handleGuestAccess = () => {
    setGuestMode(true);
    setGuestSession(true);
    router.replace("/");
    router.refresh();
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-950 px-4 text-slate-100">
      <div className="w-full max-w-md rounded-lg bg-white p-8 text-slate-900 shadow-xl">
        <h1 className="mb-2 text-3xl font-semibold">Welcome to Prompt UX</h1>
        <p className="mb-6 text-sm text-slate-600">Sign in to continue</p>
        {error && <div role="alert" className="mb-4 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
        <form onSubmit={handleLogin} className="space-y-4">
          <label className="block text-sm font-medium" htmlFor="email">
            Email
            <input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required className="mt-1 w-full rounded border border-slate-300 px-3 py-2 outline-none focus:border-slate-600" />
          </label>
          <label className="block text-sm font-medium" htmlFor="password">
            Password
            <input id="password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" required className="mt-1 w-full rounded border border-slate-300 px-3 py-2 outline-none focus:border-slate-600" />
          </label>
          <button type="submit" disabled={loading || authLoading} className="w-full rounded bg-slate-900 px-4 py-3 font-medium text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60">
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
        <button type="button" onClick={handleGuestAccess} disabled={loading || authLoading} className="mt-3 w-full rounded border border-slate-300 px-4 py-3 font-medium text-slate-900 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60">
          Continue as Guest
        </button>
        <p className="mt-6 text-center text-sm text-slate-600">
          Don&apos;t have an account? <a href="/signup" className="font-medium text-slate-900 underline">Sign Up</a>
        </p>
      </div>
    </main>
  );
}
