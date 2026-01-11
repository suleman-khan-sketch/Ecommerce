import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function GET() {
  const cookieStore = await cookies();
  const allCookies = cookieStore.getAll();

  console.log("[Debug-Auth] All cookies:", allCookies.map(c => c.name));

  const supabaseCookies = allCookies.filter(c =>
    c.name.includes('supabase') ||
    c.name.includes('sb-') ||
    c.name.includes('auth')
  );

  const response = NextResponse.json({ pending: true });

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

  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError) {
    return NextResponse.json({
      error: "User Error",
      message: userError.message,
      debug: {
        total_cookies: allCookies.length,
        all_cookie_names: allCookies.map(c => c.name),
        supabase_cookies: supabaseCookies.map(c => ({ name: c.name, length: c.value.length })),
      },
    }, { status: 500 });
  }

  if (!user) {
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
      user: {
        id: user.id,
        email: user.email,
      },
      profile_error: profileError.message,
    }, { status: 500 });
  }

  return NextResponse.json({
    authenticated: true,
    user: {
      id: user.id,
      email: user.email,
    },
    profile,
    message: "Authentication successful",
  });
}
