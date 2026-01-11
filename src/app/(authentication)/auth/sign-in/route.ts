import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";

import { loginFormSchema } from "@/app/(authentication)/login/_components/schema";
import validateFormData from "@/helpers/validateFormData";

export async function POST(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });

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
  console.log("[Sign-In] User ID:", data.user?.id);

  const { data: profile, error: profileError } = await supabase.rpc("get_my_profile");

  if (profileError) {
    console.error("[Sign-In] Profile fetch error:", profileError.message);
  } else {
    console.log("[Sign-In] Profile fetched:", JSON.stringify(profile));
  }

  return NextResponse.json({ success: true });
}
