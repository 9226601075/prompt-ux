"use client";

import { useAuth } from "@/lib/auth/AuthContext";
import { getUserInitials } from "@/lib/auth/authService";

export function UserProfile() {
  const { session, isGuest, isGoogleUser } = useAuth();

  if (!session) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-4 shadow-lg shadow-black/20">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 text-sm font-semibold text-white">
          {getUserInitials(session.user.name)}
        </div>
        <div>
          <p className="text-sm font-semibold text-white">{session.user.name}</p>
          <p className="text-xs text-slate-400">
            {isGuest ? "Guest mode" : isGoogleUser ? "Google profile" : "Authenticated"}
          </p>
        </div>
      </div>
    </div>
  );
}
