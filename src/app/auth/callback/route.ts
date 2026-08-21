import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabaseServer";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const errorDescription = searchParams.get("error_description") ?? searchParams.get("error");
  const next = searchParams.get("next") ?? "/";

  if (errorDescription) {
    const redirectUrl = new URL("/login", origin);
    redirectUrl.searchParams.set("error", errorDescription);
    return NextResponse.redirect(redirectUrl);
  }

  if (!code) {
    const redirectUrl = new URL("/login", origin);
    redirectUrl.searchParams.set("error", "Authentication code missing");
    return NextResponse.redirect(redirectUrl);
  }

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.session) {
    const redirectUrl = new URL("/login", origin);
    redirectUrl.searchParams.set("error", error?.message ?? "Failed to create session");
    return NextResponse.redirect(redirectUrl);
  }

  const finalRedirect = new URL(next.startsWith("/") ? next : "/", origin);
  return NextResponse.redirect(finalRedirect);
}
