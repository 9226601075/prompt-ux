"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/lib/auth/AuthContext";
import { getUserInitials } from "@/lib/auth/authService";

export function UserMenu() {
  const { session, signOut, isGuest, isGoogleUser } = useAuth();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  if (!session) {
    return null;
  }

  const handleLogout = async () => {
    await signOut();
    setIsOpen(false);
    router.push("/login");
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-3 rounded-full border border-white/10 bg-slate-900/70 px-3 py-2 text-left shadow-lg shadow-black/20 transition hover:border-violet-400/30"
      >
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 text-sm font-semibold text-white">
          {getUserInitials(session.user.name)}
        </div>
        <div className="hidden text-left sm:block">
          <p className="text-sm font-medium text-white">{session.user.name}</p>
          <p className="text-xs text-slate-400">
            {isGuest ? "Guest mode" : isGoogleUser ? "Google account" : "Authenticated"}
          </p>
        </div>
      </button>

      {isOpen ? (
        <div className="absolute right-0 mt-3 w-64 rounded-2xl border border-white/10 bg-slate-900/95 p-3 shadow-2xl shadow-black/30 backdrop-blur-xl">
          <div className="mb-3 rounded-xl border border-white/10 bg-white/5 p-3">
            <p className="text-sm font-semibold text-white">{session.user.name}</p>
            <p className="text-xs text-slate-400">{session.user.email ?? "Signed in as guest"}</p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 text-sm text-slate-300">
            <p className="font-medium text-white">Account mode</p>
            <p className="mt-1 text-xs text-slate-400">
              {isGuest
                ? "Guest access keeps your workspace local and separate from Google users."
                : "Google-authenticated profile ready for future Supabase integration."}
            </p>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="mt-3 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-slate-200 transition hover:bg-white/10"
          >
            Logout
          </button>
        </div>
      ) : null}
    </div>
  );
}
