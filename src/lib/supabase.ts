import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

if (!isSupabaseConfigured) {
  // eslint-disable-next-line no-console
  console.warn(
    "Supabase env vars are missing. Copy .env.example to .env and fill in your project credentials " +
      "(or set VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY as repo secrets for the GitHub Actions build)."
  );
}

// IMPORTANT: createClient() throws synchronously if given an empty/invalid URL.
// That throw happens at module-import time, before React ever mounts, which is
// what was producing the blank white screen on GitHub Pages (no env vars are
// present in a fresh Actions build). We fall back to a syntactically valid
// placeholder URL so the client can always be constructed; the hooks already
// handle request failures gracefully and surface them in the UI.
export const supabase = createClient<Database>(
  supabaseUrl || "https://placeholder.supabase.co",
  supabaseAnonKey || "placeholder-anon-key"
);
