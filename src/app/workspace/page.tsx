import MyWorkspace from "@/components/MyWorkspace";
import { createServerSupabaseClient, hasGuestSession } from "@/lib/supabaseServer";
import { redirect } from "next/navigation";

export default async function WorkspacePage() {
  if (await hasGuestSession()) {
    return <MyWorkspace />;
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/login");
  }

  return <MyWorkspace />;
}
