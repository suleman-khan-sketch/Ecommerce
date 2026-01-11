import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextRequest, NextResponse } from "next/server";

const protectedRoutes = ["/account", "/checkout"];
const adminRoutes = ["/admin"];
const authRoutes = ["/login", "/signup", "/forgot-password", "/update-password"];
const publicRoutes = ["/", "/products", "/cart"];

export async function middleware(req: NextRequest) {
  let res = NextResponse.next({
    request: {
      headers: req.headers,
    },
  });

  const pathname = req.nextUrl.pathname;

  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));
  const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route));
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));
  const isPublicRoute = publicRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  ) || pathname === "/";

  try {
    const supabase = createMiddlewareClient({ req, res });
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError) {
      console.error("[Middleware] Session error:", sessionError.message);
    }

    let activeSession = session;

    if (!session || sessionError) {
      console.log("[Middleware] No session or error, attempting to get user");
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (!userError && user) {
        console.log("[Middleware] User found via getUser():", user.email);
        activeSession = { user } as any;
      }
    }

    const isLoggedIn = !!activeSession?.user;

    if (isPublicRoute && !isAdminRoute && !isProtectedRoute) {
      return res;
    }

    if (isLoggedIn && isAuthRoute) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    if (isAdminRoute) {
      if (!isLoggedIn || !activeSession) {
        console.log("[Middleware] No session found for admin route, redirecting to login");
        const loginUrl = new URL("/login", req.url);
        loginUrl.searchParams.set("redirect_to", pathname);
        return NextResponse.redirect(loginUrl);
      }

      console.log("[Middleware] User logged in, checking profile for:", activeSession.user.email);

      const { data: profile, error: profileError } = await supabase.rpc("get_my_profile");

      if (profileError) {
        console.error("[Middleware] Profile RPC error:", profileError.message);
        console.error("[Middleware] Profile RPC details:", JSON.stringify(profileError));
      }

      console.log("[Middleware] Profile data:", JSON.stringify(profile));

      if (!profile) {
        console.log("[Middleware] No profile found, redirecting to home");
        return NextResponse.redirect(new URL("/", req.url));
      }

      const userRole = profile?.role;
      const adminRoles = ["admin", "super_admin"];

      console.log("[Middleware] User role:", userRole);

      if (!adminRoles.includes(userRole)) {
        console.log("[Middleware] User role not authorized for admin access");
        return NextResponse.redirect(new URL("/", req.url));
      }

      console.log("[Middleware] Admin access granted");
      return res;
    }

    if (isProtectedRoute) {
      if (!isLoggedIn) {
        const loginUrl = new URL("/login", req.url);
        loginUrl.searchParams.set("redirect_to", pathname);
        return NextResponse.redirect(loginUrl);
      }
      return res;
    }

    if (isAuthRoute) {
      return res;
    }

    return res;
  } catch (error) {
    console.error("[Middleware] Unexpected error:", error);
    if (isAdminRoute || isProtectedRoute) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("redirect_to", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return res;
  }
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|auth|.*\\..*|assets).*)",
  ],
};
