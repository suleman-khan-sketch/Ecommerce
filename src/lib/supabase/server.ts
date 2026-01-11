import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { Database } from "@/types/supabase";

export const createServerClient = async () => {
  try {
    const cookieStore = await cookies();
    return createServerComponentClient<Database>({ cookies: () => cookieStore });
  } catch {
    const { createClient } = await import("@supabase/supabase-js");
    return createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      }
    );
  }
};
