import { createBrowserClient as createBrowserSupabaseClient } from "@supabase/ssr";
import { Database } from "@/types/supabase";

let browserClient: ReturnType<typeof createBrowserSupabaseClient<Database>> | null = null;

export const createBrowserClient = () => {
  if (browserClient) {
    return browserClient;
  }

  browserClient = createBrowserSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  return browserClient;
};
