import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const isAdminRoute = request.nextUrl.pathname.startsWith("/admin");
  const token = await getToken({
    req: request,
    secret: process.env.AUTH_SECRET,
  });

  if (isAdminRoute) {
    if (!token) {
      console.log("[Middleware] Access denied: No token for admin route");
      return NextResponse.redirect(new URL("/", request.url));
    }

    if (token.username !== "admin") {
      console.log("[Middleware] Access denied: Not admin user", {
        username: token.username,
      });
      return NextResponse.redirect(new URL("/", request.url));
    }

    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public/).*)"],
};
