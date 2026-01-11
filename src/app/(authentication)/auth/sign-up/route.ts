import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

import { signupFormSchema } from "@/app/(authentication)/signup/_components/schema";
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

  const { name, email, password, confirmPassword, privacy } =
    await request.json();

  const { errors } = validateFormData(signupFormSchema, {
    name,
    email,
    password,
    confirmPassword,
    privacy,
  });

  if (errors) {
    return NextResponse.json({ errors }, { status: 401 });
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name: name,
      },
    },
  });

  if (error) {
    return NextResponse.json(
      {
        errors: {
          email: error.message,
        },
      },
      { status: 401 }
    );
  }

  return response;
}
