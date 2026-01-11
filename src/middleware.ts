import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextRequest, NextResponse } from "next/server";

const protectedRoutes = ["/account", "/checkout"];
const adminRoutes = ["/admin"];
const authRoutes = ["/login", "/signup", "/forgot-password", "/update-password"];
const publicRoutes = ["/", "/products", "/cart"];

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const pathname = req.nextUrl.pathname;

  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));
  const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route));
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));
  const isPublicRoute = publicRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  ) || pathname === "/";

  if (isPublicRoute && !isAdminRoute && !isProtectedRoute) {
    return res;
  }

  try {
    const supabase = createMiddlewareClient({ req, res });
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError) {
      console.error("Session error:", sessionError);
    }

    const isLoggedIn = !!session?.user;

    if (isLoggedIn && isAuthRoute) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    if (isAdminRoute) {
      if (!isLoggedIn) {
        const loginUrl = new URL("/login", req.url);
        loginUrl.searchParams.set("redirect_to", pathname);
        return NextResponse.redirect(loginUrl);
      }

      const { data: profile, error: profileError } = await supabase.rpc("get_my_profile");

      if (profileError) {
        console.error("Profile error:", profileError);
      }

      if (!profile) {
        return NextResponse.redirect(new URL("/", req.url));
      }

      const userRole = profile?.role;
      const adminRoles = ["admin", "super_admin"];

      if (!adminRoles.includes(userRole)) {
        return NextResponse.redirect(new URL("/", req.url));
      }

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
    console.error("Middleware error:", error);
    return res;
  }
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|auth|.*\\..*|assets).*)",
  ],
};
