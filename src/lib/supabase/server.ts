import { createClient } from "@supabase/supabase-js";
import { Database } from "@/types/supabase";
import { cookies } from "next/headers";

export const createServerClient = async () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  try {
    const cookieStore = await cookies();
    const allCookies = cookieStore.getAll();

    // Create cookie string for auth
    const cookieString = allCookies
      .map(cookie => `${cookie.name}=${cookie.value}`)
      .join('; ');

    return createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
      },
      global: {
        headers: cookieString ? {
          cookie: cookieString,
        } : {},
      },
    });
  } catch (error) {
    // Fallback for environments where cookies() is not available
    return createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
      },
    });
  }
};
