import { NextResponse } from "next/server";
import { auth } from './app/api/auth/[...nextauth]/route';
import type { NextRequest } from 'next/server';

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

export default auth((req: NextRequest & { auth: any }) => {
  const isLoggedIn = !!req.auth;
  const isOnLoginPage = req.nextUrl.pathname === '/login';
  const isPublicPath = publicPaths.some(path => 
    req.nextUrl.pathname.startsWith(path)
  );

  // 如果已登录且访问登录页，重定向到仪表盘
  if (isOnLoginPage && isLoggedIn) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  // 如果未登录且访问非公开路径，重定向到登录页
  if (!isLoggedIn && !isPublicPath) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('callbackUrl', req.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

// 配置中间件匹配的路径
export const config = {
  matcher: [
    /*
     * 匹配所有路径除了：
     * 1. /api/auth/* (认证相关 API)
     * 2. /_next/* (Next.js 内部文件)
     * 3. /favicon.ico, /sitemap.xml (静态文件)
     */
    '/((?!api/auth|_next|favicon.ico|sitemap.xml).*)',
  ],
}; 