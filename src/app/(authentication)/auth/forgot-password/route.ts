import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

import { passwordResetFormSchema } from "@/app/(authentication)/forgot-password/_components/schema";
import validateFormData from "@/helpers/validateFormData";
import { siteUrl } from "@/constants/siteUrl";

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

  const { email } = await request.json();

  const { errors } = validateFormData(passwordResetFormSchema, {
    email,
  });

  if (errors) {
    return NextResponse.json({ errors }, { status: 401 });
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteUrl}/update-password`,
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
