import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "⚠️ Supabase environment variables are missing! " +
    "Ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in your local .env.local file."
  );
}

// Initializing client with robust fallback to prevent application crashes during build time
export const supabase = createClient(
  supabaseUrl || "https://placeholder-project-id.supabase.co",
  supabaseAnonKey || "placeholder-anon-key"
);

/**
 * Helper to fetch the current authenticated user safely
 */
export async function getSafeUser() {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return { user, error: null };
  } catch (err) {
    console.error("Failed to retrieve user auth session:", err.message);
    return { user: null, error: err };
  }
}
