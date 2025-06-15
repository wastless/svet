import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const isAdminRoute = request.nextUrl.pathname.startsWith("/admin");
  
  // Улучшенное логирование для отладки проблем с авторизацией
  if (isAdminRoute) {
    console.log("[Middleware] Admin route accessed:", {
      path: request.nextUrl.pathname,
      hasCookies: request.cookies.size > 0,
      cookieNames: Array.from(request.cookies.getAll()).map(cookie => cookie.name),
      headers: Object.fromEntries(
        Array.from(request.headers.entries())
          .filter(([key]) => !key.includes('authorization') && !key.includes('cookie'))
      ),
    });
  }
  
  const token = await getToken({
    req: request,
    secret: process.env.AUTH_SECRET,
    secureCookie: process.env.NODE_ENV === "production"
  });

  if (isAdminRoute) {
    if (!token) {
      console.log("[Middleware] Access denied: No token for admin route");
      return NextResponse.redirect(new URL("/login", request.url));
    }

    if (token.username !== "admin") {
      console.log("[Middleware] Access denied: Not admin user", {
        username: token.username,
      });
      return NextResponse.redirect(new URL("/", request.url));
    }

    console.log("[Middleware] Admin access granted for user:", token.username);
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public/).*)"],
};
