"use client";

import Link from "next/link";
import { UserMenu } from "./UserMenu";
import { UserProfile } from "./UserProfile";

export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(124,58,237,0.16),_transparent_52%),linear-gradient(135deg,_#0f172a_0%,_#111827_100%)] text-slate-100">
      <header className="border-b border-white/10 bg-slate-950/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-violet-400/20 bg-violet-500/15 text-lg font-semibold text-violet-200">
              AI
            </div>
            <div>
              <p className="text-sm font-semibold text-white">AI Prompt Optimiser</p>
              <p className="text-xs text-slate-400">Secure workspace</p>
            </div>
          </div>

          <nav className="hidden items-center gap-5 text-sm text-slate-300 md:flex">
            <Link href="/" className="transition hover:text-white">
              Home
            </Link>
            <Link href="/workspace" className="transition hover:text-white">
              Workspace
            </Link>
          </nav>

          <UserMenu />
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6">
          <UserProfile />
        </div>
        {children}
      </main>
    </div>
  );
}
