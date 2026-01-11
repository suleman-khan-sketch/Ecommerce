import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") || "/";

  if (code) {
    const cookieStore = await cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error("[Auth Callback] Error exchanging code for session:", error.message);
      return NextResponse.redirect(new URL("/login?error=auth_error", requestUrl.origin));
    }

    console.log("[Auth Callback] Session exchanged successfully, cookies set:", cookieStore.getAll().map(c => c.name));
  }

  return NextResponse.redirect(new URL(next, requestUrl.origin));
}
