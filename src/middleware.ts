import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const isAdminRoute = request.nextUrl.pathname.startsWith("/admin");
  const isApiRoute = request.nextUrl.pathname.startsWith("/api");
  
  // Пропускаем API маршруты
  if (isApiRoute) {
    return NextResponse.next();
  }
  
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
  
  // Проверяем, что запрос относится к маршрутам, требующим проверки аутентификации
  if (isAdminRoute) {
    // Логируем все cookies для отладки
    console.log("[Middleware] All cookies:", Array.from(request.cookies.getAll()).map(cookie => cookie.name));
    
    // Проверяем, соответствует ли запрос продакшн условиям
    const isProduction = process.env.NODE_ENV === "production";
    
    // Используем оба варианта имени куки для надежности
    const cookieName = isProduction ? "__Secure-next-auth.session-token" : "next-auth.session-token";
    const cookieValue = request.cookies.get(cookieName)?.value;
    
    if (!cookieValue) {
      console.log("[Middleware] No session cookie found");
      return NextResponse.redirect(new URL("/login", request.url));
    }
    
    // Пытаемся получить токен с явным указанием имени куки
    const token = await getToken({
      req: request,
      secret: process.env.AUTH_SECRET,
      secureCookie: isProduction,
      cookieName: cookieName,
      // Используем raw: true для проверки, содержит ли запрос какой-либо токен
      raw: false
    });

    console.log("[Middleware] Token result:", token ? "Token exists" : "No token");
    
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
  matcher: [
    // Защита всех маршрутов администратора
    "/admin/:path*",
    // Отключаем проверку для статических файлов и API аутентификации
    "/((?!_next/static|_next/image|favicon.ico|public/|api/auth/).*)"],
};
