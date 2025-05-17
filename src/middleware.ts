import { NextResponse } from "next/server";
import { auth } from './app/api/auth/[...nextauth]/route';
import type { NextRequest } from 'next/server';

// 公开路径，不需要认证
const publicPaths = ["/login", "/register", "/api/auth/login"];

export default auth((req: NextRequest) => {
  const isLoggedIn = !!req.auth;
  const isOnLoginPage = req.nextUrl.pathname === '/login';
  const isOnDashboardPage = req.nextUrl.pathname.startsWith('/dashboard');

  if (isOnLoginPage && isLoggedIn) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  if (isOnDashboardPage && !isLoggedIn) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  return NextResponse.next();
});

// 配置中间件匹配的路径
export const config = {
  matcher: ['/dashboard/:path*', '/login'],
}; 