import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// 公开路径，不需要认证
const publicPaths = ["/login", "/register"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 检查是否是公开路径
  const isPublicPath = publicPaths.includes(pathname);

  // 获取 session token
  const token = await getToken({ req: request });

  // 如果用户已登录且访问公开路径，重定向到仪表板
  if (token && isPublicPath) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // 如果用户未登录且访问非公开路径，重定向到登录页
  if (!token && !isPublicPath) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

// 配置中间件匹配的路径
export const config = {
  matcher: [
    /*
     * 匹配所有路径除了：
     * 1. API 路由 (/api/*)
     * 2. Next.js 内部路由 (_next/*)
     * 3. 静态文件 (favicon.ico, robots.txt, etc.)
     */
    "/((?!api|_next|favicon.ico|robots.txt).*)",
  ],
}; 