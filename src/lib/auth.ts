import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { NextAuthConfig } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";
import type { JWT } from "next-auth/jwt";

const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

export async function signJWT(payload: any) {
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(JWT_EXPIRES_IN)
    .sign(new TextEncoder().encode(JWT_SECRET));
  return token;
}

export async function verifyJWT(token: string) {
  try {
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(JWT_SECRET)
    );
    return payload;
  } catch (error) {
    return null;
  }
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
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

export const authOptions: NextAuthConfig = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "用户名", type: "text" },
        password: { label: "密码", type: "password" }
      },
      async authorize(credentials: Partial<Record<"username" | "password", unknown>> | undefined) {
        if (!credentials?.username || !credentials?.password) {
          return null;
        }
        const username = credentials.username as string;
        const password = credentials.password as string;
        const user = await prisma.user.findUnique({
          where: { username },
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

        const isPasswordValid = await compare(password, user.password);

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user.id.toString(),
          username: user.username,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          status: user.status,
          roles: user.roles
        } as any;
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }: { token: any; user?: any }) {
      if (user) {
        token.id = user.id;
        token.username = user.username;
        token.name = user.name;
        token.email = user.email;
        token.avatar = user.avatar;
        token.status = user.status;
        token.roles = user.roles;
      }
      return token;
    },
    async session({ session, token }: { session: any; token: any }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.username = token.username as string;
        session.user.name = token.name as string;
        session.user.email = token.email as string;
        session.user.avatar = token.avatar as string | null;
        session.user.status = token.status as number;
        session.user.roles = token.roles as any;
      }
      return session;
    }
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
};

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
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) throw new Error("NEXTAUTH_SECRET is not set");

  // 优先从 cookie 中读取 token（用于 Next.js Web）
  const tokenFromCookie = await getToken({ req, secret });
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
