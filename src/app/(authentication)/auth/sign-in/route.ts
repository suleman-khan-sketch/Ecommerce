import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

import { loginFormSchema } from "@/app/(authentication)/login/_components/schema";
import validateFormData from "@/helpers/validateFormData";

export async function POST(request: Request) {
  const cookieStore = await cookies();

  const response = NextResponse.json({ success: true });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const { email, password } = await request.json();

  console.log("[Sign-In] Attempting login for:", email);

  const { errors } = validateFormData(loginFormSchema, {
    email,
    password,
  });

  if (errors) {
    console.log("[Sign-In] Validation errors:", errors);
    return NextResponse.json({ errors }, { status: 401 });
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error("[Sign-In] Authentication error:", error.message);
    return NextResponse.json(
      {
        errors: {
          password: error.message,
        },
      },
      { status: 401 }
    );
  }

  console.log("[Sign-In] Login successful for:", email);
  console.log("[Sign-In] Session created:", !!data.session);
  console.log("[Sign-In] Cookies being set:", response.cookies.getAll().map(c => c.name));

  return response;
}
