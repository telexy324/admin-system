import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { NextAuthConfig } from "next-auth";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";
import type { JWT } from "next-auth/jwt";
import bcrypt from "bcryptjs";

const AUTH_SECRET = process.env.AUTH_SECRET || "your-super-secret-jwt-key";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

// 使用 bcrypt 验证密码
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

// 使用 jose 进行密码哈希
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function signJWT(payload: any) {
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(JWT_EXPIRES_IN)
    .sign(new TextEncoder().encode(AUTH_SECRET));
  return token;
}

export async function verifyJWT(token: string) {
  try {
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(AUTH_SECRET)
    );
    return payload;
  } catch (error) {
    return null;
  }
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("next-auth.session-token")?.value;
  if (!token) return null;

  const payload = await verifyJWT(token);
  if (!payload) return null;

  const user = await prisma.user.findUnique({
    where: { id: parseInt(payload.sub as string) },
    include: {
      roles: {
        include: {
          permissions: true,
          menus: true,
        },
      },
    },
  });

  return user;
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("未授权访问");
  }
  return user;
}

export async function hasPermission(permissionCode: string) {
  const user = await getCurrentUser();
  if (!user) return false;

  return user.roles.some((role: any) =>
    role.permissions.some((permission: any) => permission.code === permissionCode)
  );
}

export async function getServerSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get("next-auth.session-token");
  
  if (!token) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: parseInt(token.value) },
    include: {
      roles: {
        include: {
          permissions: true,
          menus: true
        }
      }
    }
  });

  if (!user) {
    return null;
  }

  return {
    user: {
      id: user.id.toString(),
      username: user.username,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      status: user.status,
      roles: user.roles
    }
  };
}

export async function getUserFromRequest(req: NextRequest): Promise<JWT | null> {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not set");

  // 优先从 cookie 中读取 token（用于 Next.js Web）
  const tokenFromCookie = await getToken({ 
    req, 
    secret,
    secureCookie: process.env.NODE_ENV === "production",
    cookieName: "next-auth.session-token"
  });
  
  console.log("Token from cookie:", tokenFromCookie);
  console.log("Request cookies:", req.cookies.getAll());
  console.log("Request headers:", Object.fromEntries(req.headers.entries()));

  if (tokenFromCookie && tokenFromCookie.id) {
    return tokenFromCookie as JWT;
  }

  // Fallback：从 Authorization: Bearer 头部读取（用于 React Native）
  const authHeader = req.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    try {
      const { payload } = await jwtVerify(
        token,
        new TextEncoder().encode(secret)
      );

      // 返回 JWT 类型
      return payload as JWT;
    } catch (err) {
      console.error("JWT 验证失败:", err);
      return null;
    }
  }

  return null;
}
