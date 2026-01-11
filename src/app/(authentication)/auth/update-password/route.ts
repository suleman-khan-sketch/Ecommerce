import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

import { passwordUpdateFormSchema } from "@/app/(authentication)/update-password/_components/schema";
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

  const { password, confirmPassword, code } = await request.json();

  const { errors } = validateFormData(passwordUpdateFormSchema, {
    password,
    confirmPassword,
  });

  if (errors) {
    return NextResponse.json({ errors }, { status: 401 });
  }

  try {
    await supabase.auth.exchangeCodeForSession(code);
  } catch (err: any) {
    return NextResponse.json(
      {
        errors: {
          password: err.message,
        },
      },
      { status: 401 }
    );
  }

  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    return NextResponse.json(
      {
        errors: {
          password: error.message,
        },
      },
      { status: 401 }
    );
  }

  return response;
}
