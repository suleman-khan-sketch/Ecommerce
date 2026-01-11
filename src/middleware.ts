import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";

const protectedRoutes = ["/account", "/checkout"];
const adminRoutes = ["/admin"];
const authRoutes = ["/login", "/signup", "/forgot-password", "/update-password"];
const publicRoutes = ["/", "/products", "/cart"];

export async function middleware(req: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request: req,
  });

  const pathname = req.nextUrl.pathname;
  const isApiRoute = pathname.startsWith("/api");

  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));
  const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route));
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));
  const isPublicRoute = publicRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  ) || pathname === "/";

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            req.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request: req,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError) {
    console.error("[Middleware] User error:", userError.message);
  }

  if (isApiRoute) {
    return supabaseResponse;
  }

  const isLoggedIn = !!user;

  if (isPublicRoute && !isAdminRoute && !isProtectedRoute) {
    return supabaseResponse;
  }

  if (isLoggedIn && isAuthRoute) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  if (isAdminRoute) {
    if (!isLoggedIn) {
      console.log("[Middleware] No user found for admin route, redirecting to login");
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("redirect_to", pathname);
      return NextResponse.redirect(loginUrl);
    }

    console.log("[Middleware] User logged in, checking profile for:", user.email);

    const { data: profile, error: profileError } = await supabase.rpc("get_my_profile");

    if (profileError) {
      console.error("[Middleware] Profile RPC error:", profileError.message);
    }

    if (!profile) {
      console.log("[Middleware] No profile found, redirecting to home");
      return NextResponse.redirect(new URL("/", req.url));
    }

    const userRole = profile?.role;
    const adminRoles = ["admin", "super_admin"];

    if (!adminRoles.includes(userRole)) {
      console.log("[Middleware] User role not authorized for admin access");
      return NextResponse.redirect(new URL("/", req.url));
    }

    console.log("[Middleware] Admin access granted");
    return supabaseResponse;
  }

  if (isProtectedRoute) {
    if (!isLoggedIn) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("redirect_to", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return supabaseResponse;
  }

  if (isAuthRoute) {
    return supabaseResponse;
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|auth/callback|.*\\..*|assets).*)",
  ],
};
