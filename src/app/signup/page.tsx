"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/lib/supabaseClient";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const contactPattern = /^[+]?\d[\d\s().-]{6,19}$/;

export default function SignUpRoute() {
  const [fullName, setFullName] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && user) router.replace("/");
  }, [authLoading, router, user]);

  const handleSignup = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setMessage(null);

    if (!fullName.trim() || !contactNumber.trim() || !email.trim() || !password || !confirmPassword) {
      setError("Complete all fields to create your account.");
      return;
    }
    if (!emailPattern.test(email.trim())) {
      setError("Enter a valid email address.");
      return;
    }
    if (!contactPattern.test(contactNumber.trim())) {
      setError("Enter a valid contact number.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    if (!supabase) {
      setError("Supabase is not configured for this environment.");
      setLoading(false);
      return;
    }

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: { full_name: fullName.trim(), contact_number: contactNumber.trim() },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (signUpError) throw signUpError;
      if (data.user && data.user.identities?.length === 0) {
        throw new Error("An account with this email already exists. Please log in instead.");
      }
      if (data.session) {
        router.replace("/");
        router.refresh();
        return;
      }
      setMessage("Account created. Please check your email to verify your account before logging in.");
      setLoading(false);
    } catch (err: any) {
      setError(err?.message ?? "Unable to create your account. Please try again.");
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-950 px-4 py-8 text-slate-100">
      <div className="w-full max-w-md rounded-lg bg-white p-8 text-slate-900 shadow-xl">
        <h1 className="mb-2 text-3xl font-semibold">Create your Prompt UX account</h1>
        {error && <div role="alert" className="mb-4 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
        {message && <div role="status" className="mb-4 rounded border border-green-200 bg-green-50 p-3 text-sm text-green-700">{message}</div>}
        <form onSubmit={handleSignup} className="space-y-4">
          <label className="block text-sm font-medium" htmlFor="full-name">Full Name<input id="full-name" type="text" value={fullName} onChange={(event) => setFullName(event.target.value)} autoComplete="name" required className="mt-1 w-full rounded border border-slate-300 px-3 py-2 outline-none focus:border-slate-600" /></label>
          <label className="block text-sm font-medium" htmlFor="contact-number">Contact Number<input id="contact-number" type="tel" value={contactNumber} onChange={(event) => setContactNumber(event.target.value)} autoComplete="tel" required className="mt-1 w-full rounded border border-slate-300 px-3 py-2 outline-none focus:border-slate-600" /></label>
          <label className="block text-sm font-medium" htmlFor="signup-email">Email<input id="signup-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required className="mt-1 w-full rounded border border-slate-300 px-3 py-2 outline-none focus:border-slate-600" /></label>
          <label className="block text-sm font-medium" htmlFor="signup-password">Password<input id="signup-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="new-password" minLength={8} required className="mt-1 w-full rounded border border-slate-300 px-3 py-2 outline-none focus:border-slate-600" /></label>
          <label className="block text-sm font-medium" htmlFor="confirm-password">Confirm Password<input id="confirm-password" type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} autoComplete="new-password" minLength={8} required className="mt-1 w-full rounded border border-slate-300 px-3 py-2 outline-none focus:border-slate-600" /></label>
          <button type="submit" disabled={loading || authLoading} className="w-full rounded bg-slate-900 px-4 py-3 font-medium text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60">{loading ? "Creating account..." : "Create Account"}</button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-600">Already have an account? <a href="/login" className="font-medium text-slate-900 underline">Login</a></p>
      </div>
    </main>
  );
}
