import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    console.log("[Debug-Auth] Cookies available:", cookieStore.getAll().map(c => c.name));

    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError) {
      return NextResponse.json({
        error: "Session Error",
        message: sessionError.message,
        details: sessionError,
      }, { status: 500 });
    }

    if (!session) {
      return NextResponse.json({
        authenticated: false,
        message: "No active session found",
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
        profile_error_details: profileError,
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
