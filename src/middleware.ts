import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getUserFromRequest } from "@/lib/auth";

// 公开路径，不需要认证
const publicPaths = [
  "/login",
  "/register",
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/callback",
  "/api/auth/session",
  "/api/auth/csrf",
  "/api/auth/signin",
  "/api/auth/signout",
  "/api/auth/providers",
  "/api/auth/error",
  "/_next",
  "/favicon.ico",
];

export async function middleware(req: NextRequest) {
  const user = await getUserFromRequest(req);
  console.log(user);
  const isLoggedIn = !!user;

  const { pathname } = req.nextUrl;

  const isPublicPath = publicPaths.some((path) => pathname.startsWith(path));
  const isOnLoginPage = pathname === "/login";

  // 已登录访问登录页，重定向
  if (isLoggedIn && isOnLoginPage) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // 未登录访问受保护页面，跳转到登录页
  if (!isLoggedIn && !isPublicPath) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

// 匹配范围：除了认证 API、静态资源等
export const config = {
  matcher: [
    "/((?!api/auth|_next|favicon.ico|sitemap.xml).*)",
  ],
};
