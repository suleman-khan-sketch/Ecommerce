import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const allCookies = cookieStore.getAll();

    console.log("[Debug-Auth] All cookies:", allCookies.map(c => c.name));

    const supabaseCookies = allCookies.filter(c =>
      c.name.includes('supabase') ||
      c.name.includes('sb-') ||
      c.name.includes('auth')
    );

    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError) {
      return NextResponse.json({
        error: "Session Error",
        message: sessionError.message,
        all_cookies: allCookies.map(c => c.name),
        supabase_cookies: supabaseCookies.map(c => ({ name: c.name, length: c.value.length })),
      }, { status: 500 });
    }

    if (!session) {
      return NextResponse.json({
        authenticated: false,
        message: "No active session found",
        debug: {
          total_cookies: allCookies.length,
          all_cookie_names: allCookies.map(c => c.name),
          supabase_cookies: supabaseCookies.map(c => ({ name: c.name, length: c.value.length })),
        },
      });
    }

    const { data: profile, error: profileError } = await supabase.rpc("get_my_profile");

    if (profileError) {
      return NextResponse.json({
        authenticated: true,
        session: {
          user_id: session.user.id,
          email: session.user.email,
        },
        profile_error: profileError.message,
      }, { status: 500 });
    }

    return NextResponse.json({
      authenticated: true,
      session: {
        user_id: session.user.id,
        email: session.user.email,
      },
      profile,
      message: "Authentication successful",
    });
  } catch (error) {
    return NextResponse.json({
      error: "Unexpected Error",
      message: error instanceof Error ? error.message : "Unknown error",
    }, { status: 500 });
  }
}
