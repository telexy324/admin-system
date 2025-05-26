import { jwtVerify, SignJWT } from "jose";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import type { JWT, JWTEncodeParams, JWTDecodeParams } from "next-auth/jwt";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";
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

export async function signJWT(
  payload: any,
  secret: string = AUTH_SECRET,
  expiresIn: number | string = JWT_EXPIRES_IN
): Promise<string> {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(typeof expiresIn === "number" ? `${expiresIn}s` : expiresIn)
    .sign(new TextEncoder().encode(secret));
}

export async function verifyJWT(
  token: string,
  secret: string = AUTH_SECRET
): Promise<any | null> {
  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret));
    return payload;
  } catch {
    return null;
  }
}

// 获取 session token 的 cookie 名称
function getSessionTokenCookieName() {
  // 如果是生产环境，使用 __Secure- 前缀
  if (process.env.NODE_ENV === 'production') {
    return '__Secure-authjs.session-token';
  }
  // 本地开发环境使用普通名称
  return 'authjs.session-token';
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(getSessionTokenCookieName())?.value;
  console.log("Cookie store:", cookieStore.getAll());
  console.log("Token from cookie:", token);
  
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

// ✅ encode 函数
export async function encode(params: JWTEncodeParams<JWT>): Promise<string> {
  const { token, secret, maxAge } = params;
  if (!token) throw new Error("Missing token");

  const secretStr = Array.isArray(secret) ? secret[0] : secret;

  // 使用已有 signJWT，只是要传 secret 和 maxAge
  return await signJWT(token, secretStr, maxAge);
}

// ✅ decode 函数
export async function decode(params: JWTDecodeParams): Promise<JWT | null> {
  const { token, secret } = params;
  if (!token) return null;

  const secretStr = Array.isArray(secret) ? secret[0] : secret;

  // 使用已有 verifyJWT，传入 secret
  return await verifyJWT(token, secretStr) as JWT;
}

export async function getUserFromRequest(req: NextRequest): Promise<JWT | null> {
  const secret = process.env.AUTH_SECRET;
  console.log("secret: ", secret);
  if (!secret) throw new Error("JWT_SECRET is not set");
  console.log("cookies: ", req.cookies);
  // 从 cookie 中直接获取 token
  const sessionToken = req.cookies.get("authjs.session-token")?.value;
  console.log("Session token from cookie:", sessionToken);

  if (sessionToken) {
    try {
      const { payload } = await jwtVerify(
        sessionToken,
        new TextEncoder().encode(secret)
      );
      return payload as JWT;
    } catch (err) {
      console.error("JWT 验证失败:", err);
      return null;
    }
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
      return payload as JWT;
    } catch (err) {
      console.error("JWT 验证失败:", err);
      return null;
    }
  }

  return null;
}
