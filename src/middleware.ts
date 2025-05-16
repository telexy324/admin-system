import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

// 公开路径，不需要认证
const publicPaths = ["/login", "/register"];

// 验证 token
async function verifyToken(token: string) {
  try {
    const secret = new TextEncoder().encode(
      process.env.JWT_SECRET || "your-secret-key"
    );
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch (error) {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 检查是否是公开路径
  const isPublicPath = publicPaths.includes(pathname);

  // 获取 token
  const token = request.cookies.get("token")?.value;

  // 验证 token
  const payload = token ? await verifyToken(token) : null;

  // 如果用户已登录且访问公开路径，重定向到仪表板
  if (payload && isPublicPath) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // 如果用户未登录且访问非公开路径，重定向到登录页
  if (!payload && !isPublicPath) {
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