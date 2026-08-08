"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AuthShell } from "./AuthShell";
import { useAuth } from "@/lib/auth/AuthContext";

const publicRoutes = ["/", "/login", "/signup", "/forgot"];

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isHydrated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const isPublicRoute = publicRoutes.includes(pathname || "");

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    if (!isAuthenticated && !isPublicRoute) {
      router.replace("/login");
    }
  }, [isAuthenticated, isHydrated, isPublicRoute, router]);

  if (!isHydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(124,58,237,0.16),_transparent_52%),linear-gradient(135deg,_#0f172a_0%,_#111827_100%)] text-sm text-slate-300">
        <div className="rounded-2xl border border-white/10 bg-slate-900/70 px-6 py-5 shadow-2xl shadow-black/30">
          Preparing your workspace...
        </div>
      </div>
    );
  }

  if (isPublicRoute) {
    return <>{children}</>;
  }

  if (!isAuthenticated) {
    return null;
  }

  return <AuthShell>{children}</AuthShell>;
}
