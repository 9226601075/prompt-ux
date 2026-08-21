"use client";

import React from "react";
import { useAuth } from "@/components/AuthProvider";

export default function LogoutButton() {
  const { signOut, loading, user } = useAuth();

  if (loading || !user) {
    return null;
  }

  return (
    <button
      onClick={() => signOut()}
      className="px-3 py-1 rounded bg-gray-200 text-sm text-slate-900"
    >
      Sign out
    </button>
  );
}
