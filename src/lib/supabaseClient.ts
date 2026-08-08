import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

const fallbackAuth = {
  getSession: async () => ({ data: { session: null }, error: null }),
  onAuthStateChange: () => ({
    data: {
      subscription: {
        unsubscribe: () => {},
      },
    },
  }),
  signInWithPassword: async () => ({
    data: { session: null },
    error: new Error("Supabase is not configured."),
  }),
  signUp: async () => ({
    data: { session: null },
    error: new Error("Supabase is not configured."),
  }),
  resetPasswordForEmail: async () => ({
    error: new Error("Supabase is not configured."),
  }),
  signInWithOAuth: async () => ({
    error: new Error("Supabase is not configured."),
  }),
  signOut: async () => ({
    error: null,
  }),
};

export const supabase: SupabaseClient = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        detectSessionInUrl: true,
      },
    })
  : ({ auth: fallbackAuth } as unknown as SupabaseClient);
