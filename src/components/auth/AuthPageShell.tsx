import Link from "next/link";
import type { ReactNode } from "react";

interface AuthPageShellProps {
  title: string;
  subtitle: string;
  bottomText: string;
  bottomLinkHref: string;
  bottomLinkText: string;
  children: ReactNode;
}

export function AuthPageShell({
  title,
  subtitle,
  bottomText,
  bottomLinkHref,
  bottomLinkText,
  children,
}: AuthPageShellProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(124,58,237,0.16),_transparent_52%),linear-gradient(135deg,_#0f172a_0%,_#111827_100%)] px-4 py-10 text-slate-100">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-slate-900/80 p-8 shadow-2xl shadow-black/30 backdrop-blur-xl">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-violet-400/20 bg-violet-500/15 text-xl font-semibold text-violet-200">
            AI
          </div>
          <div>
            <p className="text-lg font-semibold text-white">{title}</p>
            <p className="text-sm text-slate-400">{subtitle}</p>
          </div>
        </div>

        <div className="space-y-5">{children}</div>

        <div className="mt-6 text-center text-sm text-slate-400">
          {bottomText} <Link href={bottomLinkHref} className="font-semibold text-white hover:text-violet-300">{bottomLinkText}</Link>
        </div>
      </div>
    </div>
  );
}
