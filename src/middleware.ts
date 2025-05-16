import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyJWT } from "./lib/auth";

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;

  // 如果是登录页面，直接放行
  if (request.nextUrl.pathname.startsWith("/login")) {
    return NextResponse.next();
  }

  // 如果没有token，重定向到登录页
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // 验证token
  const payload = await verifyJWT(token);
  if (!payload) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * 匹配所有路径除了:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!api|_next/static|_next/image|favicon.ico|public).*)",
  ],
}; 